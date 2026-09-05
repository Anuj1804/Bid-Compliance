from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.db import get_db
from database.models import Flag
from database.schemas import FlagUpdate, FlagOut
from backend.services import audit_service
from backend.services.auth_service import get_current_user, CurrentUser

router = APIRouter(prefix="/api/flags", tags=["flags"])


@router.patch("/{flag_id}", response_model=FlagOut)
def update_flag(
    flag_id: int,
    payload: FlagUpdate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Officer resolves/escalates a flag. This is deliberately a human action —
    the AI never auto-resolves its own flags. Every call here writes an
    OFFICER_DECISION audit_log entry with a before/after snapshot.
    """
    flag = db.query(Flag).filter(Flag.id == flag_id).first()
    if not flag:
        raise HTTPException(status_code=404, detail="Flag not found")

    previous_state = {
        "status": flag.status,
        "officer_note": flag.officer_note,
        "resolved_by": flag.resolved_by,
    }

    flag.status = payload.status
    flag.officer_note = payload.officer_note
    if payload.status in ("resolved", "escalated"):
        flag.resolved_at = datetime.now(timezone.utc)
        flag.resolved_by = current_user.username

    db.commit()
    db.refresh(flag)

    new_state = {
        "status": flag.status,
        "officer_note": flag.officer_note,
        "resolved_by": flag.resolved_by,
    }

    audit_service.log_officer_decision(
        db, bidder_id=flag.bidder_id, actor=current_user.username,
        flag_id=flag.id, previous_state=previous_state, new_state=new_state,
    )

    return flag