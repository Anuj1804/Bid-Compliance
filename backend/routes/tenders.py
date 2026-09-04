from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.db import get_db
from database.models import Tender
from database.schemas import TenderCreate, TenderOut

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
    return db.query(Tender).order_by(Tender.created_at.desc()).all()