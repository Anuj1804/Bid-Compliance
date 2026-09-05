import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session

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

    return bidders


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

    # Save file locally
    safe_filename = f"{bidder_id}_{document_type}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Trigger Person 2's OCR extraction (stub for now — see ocr_service.py)
    extracted = ocr_service.extract_fields(file_path, document_type)
    confidence = ocr_service.overall_confidence(extracted)

    document = Document(
        bidder_id=bidder_id,
        document_type=document_type,
        file_path=file_path,
        extracted_fields=extracted,
        extraction_confidence=confidence,
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    audit_service.log_document_uploaded(
        db, bidder_id=bidder_id, actor=current_user.username,
        document_type=document_type, extraction_confidence=confidence,
    )

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

    # Merge extracted fields across all of this bidder's documents into one
    # dict — last-document-wins per field is fine for the hackathon; a real
    # system would reconcile conflicts explicitly.
    documents = db.query(Document).filter(Document.bidder_id == bidder_id).all()
    merged_extracted = {}
    for doc in documents:
        if doc.extracted_fields:
            merged_extracted.update(doc.extracted_fields)

    # Call Person 3's orchestrator (stub for now — see verification_service.py)
    result = verification_service.run_orchestrator(merged_extracted)

    verification = VerificationResult(
        bidder_id=bidder_id,
        compliance_score=result["compliance_score"],
        risk_level=result["risk_level"],
        recommendation=result.get("recommendation"),
        checks=result["checks"],
    )
    db.add(verification)
    db.commit()
    db.refresh(verification)

    # Audit: the verification run as a whole
    audit_service.log_check_performed(
        db, bidder_id=bidder_id, actor=current_user.username,
        checks_summary=f"{len(result['checks'])} checks run",
        new_state=result,
    )
    audit_service.log_score_calculated(
        db, bidder_id=bidder_id, actor=current_user.username,
        score=result["compliance_score"], risk_level=result["risk_level"],
    )

    # Raise a Flag row for every check that came back flagged
    for check in result["checks"]:
        if check.get("flag"):
            flag = Flag(
                bidder_id=bidder_id,
                check_type=check["check"],
                status="open",
                severity=check.get("severity"),
                reason=check.get("reason"),
                declared_value=None,
                verified_value=None,
            )
            db.add(flag)
            db.commit()
            audit_service.log_flag_raised(
                db, bidder_id=bidder_id, actor=current_user.username,
                check_type=check["check"], reason=check.get("reason", ""),
            )

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