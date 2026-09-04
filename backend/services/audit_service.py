"""
Append-only audit logging.

RULE: This module contains the ONLY functions that write to audit_log.
Every function here does an INSERT and nothing else — no updates, no
deletes, no exceptions. If you ever find yourself wanting to "fix" an
audit_log row, that's a signal something is wrong upstream: write a new
correcting entry instead, don't edit history.
"""

from typing import Optional, Any, Dict
from sqlalchemy.orm import Session

from database.models import AuditLog


def log_event(
    db: Session,
    event_type: str,
    actor: str,
    bidder_id: Optional[int] = None,
    details: Optional[str] = None,
    previous_state: Optional[Dict[str, Any]] = None,
    new_state: Optional[Dict[str, Any]] = None,
) -> AuditLog:
    """
    Write one audit_log row. Call this from route handlers/services after
    every meaningful action — never batch-skip it "for now."
    """
    entry = AuditLog(
        bidder_id=bidder_id,
        event_type=event_type,
        actor=actor,
        details=details,
        previous_state=previous_state,
        new_state=new_state,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


# Named helpers for each event type — thin wrappers, but they make call
# sites self-documenting and stop event_type strings from drifting/typo-ing
# across the codebase.

def log_document_uploaded(db: Session, bidder_id: int, actor: str, document_type: str, extraction_confidence: Optional[float]):
    return log_event(
        db, event_type="DOCUMENT_UPLOADED", actor=actor, bidder_id=bidder_id,
        details=f"{document_type} document uploaded, extraction_confidence={extraction_confidence}",
    )


def log_check_performed(db: Session, bidder_id: int, actor: str, checks_summary: str, new_state: Dict[str, Any]):
    return log_event(
        db, event_type="CHECK_PERFORMED", actor=actor, bidder_id=bidder_id,
        details=checks_summary, new_state=new_state,
    )


def log_flag_raised(db: Session, bidder_id: int, actor: str, check_type: str, reason: str):
    return log_event(
        db, event_type="FLAG_RAISED", actor=actor, bidder_id=bidder_id,
        details=f"{check_type}: {reason}",
    )


def log_score_calculated(db: Session, bidder_id: int, actor: str, score: int, risk_level: str):
    return log_event(
        db, event_type="SCORE_CALCULATED", actor=actor, bidder_id=bidder_id,
        details=f"compliance_score={score}, risk_level={risk_level}",
    )


def log_officer_reviewed(db: Session, bidder_id: int, actor: str):
    return log_event(
        db, event_type="OFFICER_REVIEWED", actor=actor, bidder_id=bidder_id,
        details="Officer opened bidder detail view",
    )


def log_officer_decision(db: Session, bidder_id: int, actor: str, flag_id: int, previous_state: Dict[str, Any], new_state: Dict[str, Any]):
    return log_event(
        db, event_type="OFFICER_DECISION", actor=actor, bidder_id=bidder_id,
        details=f"Flag {flag_id} updated by officer",
        previous_state=previous_state, new_state=new_state,
    )


def log_blacklist_entry_added(db: Session, actor: str, company_name: str, entry_id: int):
    return log_event(
        db, event_type="BLACKLIST_ENTRY_ADDED", actor=actor, bidder_id=None,
        details=f"Blacklist entry #{entry_id} added for {company_name}",
    )