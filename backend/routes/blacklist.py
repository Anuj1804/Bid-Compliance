from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.db import get_db
from database.models import BlacklistSandbox
from database.schemas import BlacklistCreate, BlacklistOut
from backend.services import audit_service
from backend.services.auth_service import require_admin, CurrentUser

router = APIRouter(prefix="/api/blacklist", tags=["blacklist"])


@router.get("", response_model=List[BlacklistOut])
def list_blacklist(db: Session = Depends(get_db)):
    """Readable by anyone logged in — only writes are admin-gated."""
    return db.query(BlacklistSandbox).all()


@router.post("", response_model=BlacklistOut)
def add_blacklist_entry(
    payload: BlacklistCreate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(require_admin),
):
    entry = BlacklistSandbox(
        pan=payload.pan,
        company_name=payload.company_name,
        reason=payload.reason,
        debarred_until=payload.debarred_until,
        added_by=current_user.username,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    audit_service.log_blacklist_entry_added(
        db, actor=current_user.username, company_name=entry.company_name, entry_id=entry.id,
    )

    return entry


@router.delete("/{entry_id}")
def remove_blacklist_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(require_admin),
):
    entry = db.query(BlacklistSandbox).filter(BlacklistSandbox.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Blacklist entry not found")

    company_name = entry.company_name
    db.delete(entry)
    db.commit()

    # Note: deleting the blacklist entry itself is fine — it's a live sandbox
    # table, not the audit trail. We still log the *action* of deleting it,
    # append-only, in audit_log.
    audit_service.log_event(
        db, event_type="BLACKLIST_ENTRY_REMOVED", actor=current_user.username,
        details=f"Blacklist entry #{entry_id} removed for {company_name}",
    )

    return {"detail": f"Blacklist entry {entry_id} removed"}