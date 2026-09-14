from typing import List
from fastapi import APIRouter, Depends
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.db import get_db
# from database.models import Tender
from database.schemas import TenderCreate, TenderOut
from database.models import Tender, Bidder, VerificationResult

router = APIRouter(prefix="/api/tenders", tags=["tenders"])


@router.post("", response_model=TenderOut)
def create_tender(payload: TenderCreate, db: Session = Depends(get_db)):
    """Dev/seeding endpoint — create a tender with its required-checks list
    (Person 1's checklist parser output)."""
    tender = Tender(
        title=payload.title,
        description=payload.description,
        required_checks=payload.required_checks,
    )
    db.add(tender)
    db.commit()
    db.refresh(tender)
    return tender


@router.get("", response_model=List[TenderOut])
def list_tenders(db: Session = Depends(get_db)):
    tenders = db.query(Tender).order_by(Tender.created_at.desc()).all()
    result = []
    for t in tenders:
        bidders = db.query(Bidder).filter(Bidder.tender_id == t.id).all()
        bidder_count = len(bidders)
        scores = []
        risk_counts = {"LOW": 0, "MEDIUM": 0, "HIGH": 0}
        for b in bidders:
            latest = (
                db.query(VerificationResult)
                .filter(VerificationResult.bidder_id == b.id)
                .order_by(VerificationResult.calculated_at.desc())
                .first()
            )
            if latest:
                scores.append(latest.compliance_score)
                level = latest.risk_level
                if level in risk_counts:
                    risk_counts[level] += 1
        avg = round(sum(scores) / len(scores), 1) if scores else None
        result.append(TenderOut(
            id=t.id,
            title=t.title,
            description=t.description,
            required_checks=t.required_checks,
            created_at=t.created_at,
            document_path=t.document_path,
            bidder_count=bidder_count,
            avg_compliance=avg,
            risk_summary=risk_counts,
        ))
    return result
@router.get("/{tender_id}/document")
def get_tender_document(tender_id: int, db: Session = Depends(get_db)):
    from fastapi.responses import FileResponse
    import os
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender or not tender.document_path:
        raise HTTPException(status_code=404, detail="Tender document not found")
    if not os.path.exists(tender.document_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    return FileResponse(tender.document_path)