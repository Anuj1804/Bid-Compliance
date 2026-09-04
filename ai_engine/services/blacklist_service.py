"""
Blacklist / debarment check - STATUS: SIMULATED (sandbox data).

Unlike the other checks, this isn't a document check - it's a lookup
against a list, triggered using identifiers already extracted from the
bidder's other documents (PAN, company name).

A match here is CRITICAL severity and should override the overall risk
level to HIGH in the scoring engine, regardless of how clean every other
check is.

UPDATED (Option A, agreed with Person 4): reads live from the backend's
BlacklistSandbox DB table via get_active_blacklist(), instead of the old
static blacklist_sandbox.json file. This means an admin adding a company
through the admin panel is immediately visible to this check on the very
next /verify call — no stale JSON, no sync step needed.
"""

from status import result, SIMULATED, MISMATCH
from name_match import names_match
from backend.services.blacklist_provider import get_active_blacklist


def check_blacklist(pan: str, company_name: str) -> dict:
    blacklist = get_active_blacklist()

    for entry in blacklist:
        pan_match = entry["pan"] == pan
        name_match = names_match(entry["name"], company_name)

        if pan_match or name_match:
            return result(
                check_name="Blacklist",
                status=MISMATCH,
                flag=True,
                severity="CRITICAL",
                reason=f"Match found: {entry['reason']} (debarred until {entry['debarred_until']})",
                source="SIMULATED — sandbox debarment list (production: CVC/GeM debarred vendor registry)",
                evidence=entry,
            )

    return result(
        check_name="Blacklist",
        status=SIMULATED,
        flag=False,
        reason="No match found in sandbox debarment list",
        source="SIMULATED — sandbox debarment list (production: CVC/GeM debarred vendor registry)",
    )