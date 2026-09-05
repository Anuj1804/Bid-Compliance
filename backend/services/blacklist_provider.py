"""
Blacklist provider — the ONE place blacklist data is read from.

This replaces Person 3's static blacklist_sandbox.json approach (Option A,
agreed with Person 3): instead of two divergent copies of blacklist data
(their JSON file vs. our live DB table), Person 3's blacklist check now
calls get_active_blacklist() below, which reads directly from the same
BlacklistSandbox table the admin panel writes to.

This means: admin adds a company via POST /api/blacklist -> it is
IMMEDIATELY visible to Person 3's verification check on the very next
/verify call. No sync step, no stale JSON file, no demo-day surprise.
"""

from datetime import datetime, timezone
from typing import List, Dict, Any

from database.db import SessionLocal
from database.models import BlacklistSandbox


def get_active_blacklist() -> List[Dict[str, Any]]:
    """
    Returns all current blacklist entries as plain dicts, matching the
    exact shape ai-engine/services/blacklist_service.py expects (same key
    names it already uses from its old JSON file — "name", not
    "company_name" — so their check_blacklist() code needs zero changes):
        [{"pan": ..., "name": ..., "reason": ..., "debarred_until": "YYYY-MM-DD"}, ...]

    Call this fresh on every verification run — don't cache it in ai-engine,
    since the whole point of Option A is that admin changes take effect
    immediately.
    """
    db = SessionLocal()
    try:
        entries = db.query(BlacklistSandbox).all()
        return [
            {
                "pan": e.pan,
                "name": e.company_name,
                "reason": e.reason,
                "debarred_until": e.debarred_until.strftime("%Y-%m-%d") if e.debarred_until else None,
            }
            for e in entries
        ]
    finally:
        db.close()


def is_currently_debarred(entry: Dict[str, Any]) -> bool:
    """
    Helper for Person 3's check: a blacklist entry only counts as an active
    debarment if debarred_until is null (permanent) or in the future.
    """
    if entry.get("debarred_until") is None:
        return True
    debarred_until = datetime.fromisoformat(entry["debarred_until"])
    return debarred_until > datetime.now(timezone.utc)