"""
GST verification - STATUS: real/live data, read from a local cache.

Why cached rather than a live API call during the demo: this keeps the
live presentation fully offline/network-independent, while the underlying
data is genuinely real (fetched once by Person 1, not fabricated).

In a real production deployment, this cache read would be replaced with
a live call to an authorized GSP (GST Suvidha Provider) API.
"""

import json
import os

from status import result, VERIFIED, UNVERIFIED, MISMATCH
from name_match import names_match

CACHE_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "gst_cache.json")


def _load_cache() -> dict:
    with open(CACHE_PATH) as f:
        return json.load(f)


def verify_gstin(gstin: str) -> dict:
    """Raw lookup - returns the cached record, or None if not found."""
    cache = _load_cache()
    return cache.get(gstin)


def check_gst_compliance(declared_gstin: str, declared_name: str) -> dict:
    """
    Full compliance check used by the verification pipeline.
    Returns a standard result() dict - see status.py
    """
    record = verify_gstin(declared_gstin)

    if record is None:
        return result(
            check_name="GST",
            status=UNVERIFIED,
            flag=True,
            reason="GSTIN not found in verification cache",
            source="GST Portal (cached lookup)",
        )

    registration_status = record.get("sts")
    legal_name = record.get("lgnm", "")

    if registration_status != "Active":
        return result(
            check_name="GST",
            status=MISMATCH,
            flag=True,
            severity="HIGH",
            reason=f"GST registration status is '{registration_status}', not Active",
            source="GST Portal (cached lookup)",
            evidence=record,
        )

    if not names_match(declared_name, legal_name):
        return result(
            check_name="GST",
            status=MISMATCH,
            flag=True,
            severity="HIGH",
            reason=f"Declared name '{declared_name}' does not match GST legal name '{legal_name}'",
            source="GST Portal (cached lookup)",
            evidence=record,
        )

    return result(
        check_name="GST",
        status=VERIFIED,
        flag=False,
        reason="GSTIN active, name matches",
        source="GST Portal (cached lookup)",
        evidence=record,
    )