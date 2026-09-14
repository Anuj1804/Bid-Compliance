import os
import shutil
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database.db import get_db
from database.models import Bidder, Document, VerificationResult, Flag, AuditLog
from database.schemas import (
    BidderCreate, BidderOut, DocumentOut, VerificationResultOut,
    BidderDetailOut, AuditLogOut,
)
from backend.services import audit_service, ocr_service, verification_service
from backend.services.auth_service import get_current_user, CurrentUser

router = APIRouter(prefix="/api/bidders", tags=["bidders"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("", response_model=BidderOut)
def register_bidder(payload: BidderCreate, db: Session = Depends(get_db)):
    bidder = Bidder(
        tender_id=payload.tender_id,
        company_name=payload.company_name,
        declared_gstin=payload.declared_gstin,
        declared_pan=payload.declared_pan,
        declared_udyam=payload.declared_udyam,
    )
    db.add(bidder)
    db.commit()
    db.refresh(bidder)
    return bidder


@router.get("", response_model=List[BidderOut])
def list_bidders(
    tender_id: Optional[int] = None,
    risk_level: Optional[str] = Query(None, description="Filter by latest verification risk level"),
    db: Session = Depends(get_db),
):
    query = db.query(Bidder)
    if tender_id is not None:
        query = query.filter(Bidder.tender_id == tender_id)
    bidders = query.all()

    if risk_level:
        # Filter by each bidder's most recent verification result
        filtered = []
        for b in bidders:
            latest = (
                db.query(VerificationResult)
                .filter(VerificationResult.bidder_id == b.id)
                .order_by(VerificationResult.calculated_at.desc())
                .first()
            )
            if latest and latest.risk_level == risk_level:
                filtered.append(b)
        return filtered

    enriched = []
    for b in bidders:
        latest = (
            db.query(VerificationResult)
            .filter(VerificationResult.bidder_id == b.id)
            .order_by(VerificationResult.calculated_at.desc())
            .first()
        )
        flag_count = db.query(Flag).filter(Flag.bidder_id == b.id, Flag.status == "open").count()
        enriched.append(BidderOut(
            id=b.id,
            tender_id=b.tender_id,
            company_name=b.company_name,
            declared_gstin=b.declared_gstin,
            declared_pan=b.declared_pan,
            declared_udyam=b.declared_udyam,
            created_at=b.created_at,
            compliance_score=latest.compliance_score if latest else None,
            risk_level=latest.risk_level if latest else None,
            flag_count=flag_count,
            status=b.status,
        ))
    return enriched


@router.post("/{bidder_id}/documents", response_model=DocumentOut)
def upload_document(
    bidder_id: int,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    bidder = db.query(Bidder).filter(Bidder.id == bidder_id).first()
    if not bidder:
        raise HTTPException(status_code=404, detail="Bidder not found")
    
    # Release the database read lock immediately so we don't hold it during the 10-second OCR process!
    db.commit()

    safe_filename = f"{bidder_id}_{document_type}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    with open(file_path, "wb") as f:
        import shutil
        shutil.copyfileobj(file.file, f)

    # [Robust]: Safely handle if OCR returns None
    extracted = ocr_service.extract_fields(file_path, document_type) or {}
    confidence = ocr_service.overall_confidence(extracted)

    # Remove old document of the same type to prevent duplicates
    db.query(Document).filter(Document.bidder_id == bidder_id, Document.document_type == document_type).delete()

    document = Document(
        bidder_id=bidder_id,
        document_type=document_type,
        file_path=file_path,
        extracted_fields=extracted,
        extraction_confidence=confidence,
    )
    db.add(document)
    
    # Re-fetch bidder and reset status because AI scan needs to be re-run
    bidder = db.query(Bidder).filter(Bidder.id == bidder_id).first()
    if bidder:
        bidder.status = "NEEDS_REVIEW"

    db.commit()

    audit_service.log_document_uploaded(
        db, bidder_id=bidder_id, actor=current_user.username,
        document_type=document_type, extraction_confidence=confidence,
    )

    db.refresh(document)
    return document


@router.post("/{bidder_id}/verify", response_model=VerificationResultOut)
def verify_bidder(
    bidder_id: int,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    bidder = db.query(Bidder).filter(Bidder.id == bidder_id).first()
    if not bidder:
        raise HTTPException(status_code=404, detail="Bidder not found")

    # [FIX]: Delete old verification results to prevent duplicate stacking!
    db.query(VerificationResult).filter(VerificationResult.bidder_id == bidder_id).delete()

    # Preserve old flag states before deleting them
    old_flags = db.query(Flag).filter(Flag.bidder_id == bidder_id).all()
    old_flag_map = {f.check_type: f for f in old_flags}
    db.query(Flag).filter(Flag.bidder_id == bidder_id).delete()
    
    db.commit()

    documents = db.query(Document).filter(Document.bidder_id == bidder_id).all()
    merged_extracted = {}
    for doc in documents:
        if not doc.extracted_fields:
            continue
        for k, v in doc.extracted_fields.items():
            if k not in merged_extracted or (isinstance(v, dict) and v.get("confidence", 0) > merged_extracted.get(k, {}).get("confidence", 0)):
                merged_extracted[k] = v

    # Release DB read lock before orchestrator runs
    db.commit()

    result = verification_service.run_orchestrator(merged_extracted)

    risk_level_val = result.get("risk_level", "HIGH")
    
    # Update bidder status based on AI risk
    if risk_level_val in ["MEDIUM", "HIGH"]:
        bidder.status = "FLAGGED"
    else:
        bidder.status = "NEEDS_REVIEW"

    verification = VerificationResult(
        bidder_id=bidder_id,
        compliance_score=result.get("compliance_score", 0),
        risk_level=risk_level_val,
        recommendation=result.get("recommendation"),
        checks=result.get("checks", []),
    )
    db.add(verification)
    db.commit()

    audit_service.log_check_performed(
        db, bidder_id=bidder_id, actor=current_user.username,
        checks_summary="Verification checks run",
        new_state=result,
    )
    audit_service.log_score_calculated(
        db, bidder_id=bidder_id, actor=current_user.username,
        score=result.get("compliance_score", 0), risk_level=result.get("risk_level", "HIGH"),
    )

    # [Robust]: Intercept AI hallucinated string instead of crashing
    checks_list = result.get("checks", [])
    if isinstance(checks_list, list):
        for check in checks_list:
            if isinstance(check, dict) and check.get("flag"):
                check_type = check.get("check", "unknown")
                old_f = old_flag_map.get(check_type)
                flag = Flag(
                    bidder_id=bidder_id,
                    check_type=check_type,
                    status=old_f.status if old_f else "open",
                    severity=check.get("severity"),
                    reason=check.get("reason"),
                    declared_value=(bidder.declared_gstin if check_type == "GST" else 
                                    bidder.declared_pan if check_type == "PAN" else 
                                    bidder.declared_udyam if check_type == "Udyam" else None),
                    verified_value=str(check.get("evidence", {}).get("lgnm") or 
                                       check.get("evidence", {}).get("enterprise_name") or ""),
                    resolved_at=old_f.resolved_at if old_f else None,
                    resolved_by=old_f.resolved_by if old_f else None,
                    officer_note=old_f.officer_note if old_f else None,
                )
                db.add(flag)
        db.commit()
        for check in checks_list:
            if isinstance(check, dict) and check.get("flag"):
                audit_service.log_flag_raised(
                    db, bidder_id=bidder_id, actor=current_user.username,
                    check_type=check.get("check", "unknown"), reason=check.get("reason", ""),
                )

    db.refresh(verification)
    return verification


@router.get("/{bidder_id}", response_model=BidderDetailOut)
def get_bidder_detail(
    bidder_id: int,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    bidder = db.query(Bidder).filter(Bidder.id == bidder_id).first()
    if not bidder:
        raise HTTPException(status_code=404, detail="Bidder not found")

    latest_verification = (
        db.query(VerificationResult)
        .filter(VerificationResult.bidder_id == bidder_id)
        .order_by(VerificationResult.calculated_at.desc())
        .first()
    )
    documents = db.query(Document).filter(Document.bidder_id == bidder_id).all()
    flags = db.query(Flag).filter(Flag.bidder_id == bidder_id).all()

    # Every officer view of a bidder's detail is itself an auditable event
    audit_service.log_officer_reviewed(db, bidder_id=bidder_id, actor=current_user.username)

    return BidderDetailOut(
        id=bidder.id,
        company_name=bidder.company_name,
        tender_id=bidder.tender_id,
        declared_gstin=bidder.declared_gstin,
        declared_pan=bidder.declared_pan,
        declared_udyam=bidder.declared_udyam,
        status=bidder.status,
        documents=documents,
        latest_verification=latest_verification,
        flags=flags,
    )


@router.get("/{bidder_id}/audit", response_model=List[AuditLogOut])
def get_bidder_audit_trail(bidder_id: int, db: Session = Depends(get_db)):
    return (
        db.query(AuditLog)
        .filter(AuditLog.bidder_id == bidder_id)
        .order_by(AuditLog.timestamp.asc())
        .all()
    )

@router.get("/{bidder_id}/documents/{doc_id}/file")
def serve_document_file(bidder_id: int, doc_id: int, db: Session = Depends(get_db)):
    from fastapi.responses import FileResponse
    doc = db.query(Document).filter(
        Document.id == doc_id,
        Document.bidder_id == bidder_id
    ).first()
    if not doc or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="Document file not found")
    return FileResponse(doc.file_path)

# ---------------------------------------------------------
# OFFICER FINAL DECISION API
# ---------------------------------------------------------
class DecisionPayload(BaseModel):
    decision: str
    note: str

@router.post("/{bidder_id}/decision")
def submit_officer_decision(
    bidder_id: int,
    payload: DecisionPayload,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    bidder = db.query(Bidder).filter(Bidder.id == bidder_id).first()
    if not bidder:
        raise HTTPException(status_code=404, detail="Bidder not found")

    # 1. Log the decision in the Audit Trail
    log = AuditLog(
        bidder_id=bidder_id,
        event_type="OFFICER_DECISION",
        actor=current_user.username,
        details=f"Officer marked bidder as {payload.decision}",
        new_state={"decision": payload.decision, "note": payload.note}
    )
    db.add(log)
    
    # 2. FIX: Agar Officer ne "APPROVE" kiya hai, toh saare Open Flags ko "Resolved" mark kar do
    if payload.decision == "APPROVED":
        bidder.status = "COMPLIANT"
        open_flags = db.query(Flag).filter(Flag.bidder_id == bidder_id, Flag.status == "open").all()
        for flag in open_flags:
            flag.status = "resolved"
            flag.resolved_by = current_user.username
            flag.resolved_at = datetime.now(timezone.utc)
            flag.officer_note = f"Auto-resolved via Final Decision: {payload.note}"
    else:
        bidder.status = "NON_COMPLIANT"
            
    db.commit()
    
    return {"status": "ok", "message": "Decision logged successfully and status updated"}