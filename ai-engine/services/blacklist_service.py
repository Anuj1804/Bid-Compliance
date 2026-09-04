"""
Blacklist / debarment check - STATUS: SIMULATED (sandbox data).

Unlike the other checks, this isn't a document check - it's a lookup
against a list, triggered using identifiers already extracted from the
bidder's other documents (PAN, company name).

A match here is CRITICAL severity and should override the overall risk
level to HIGH in the scoring engine, regardless of how clean every other
check is.
"""

import json
import os

from status import result, SIMULATED, MISMATCH
from name_match import names_match

SANDBOX_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "blacklist_sandbox.json")


def _load_blacklist() -> list:
    with open(SANDBOX_PATH) as f:
        return json.load(f)


def check_blacklist(pan: str, company_name: str) -> dict:
    blacklist = _load_blacklist()

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