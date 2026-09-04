"""
Verification orchestrator - runs a bidder through GST, PAN, Udyam, and
Blacklist checks, then feeds everything into the rule engine.

This is the function Person 4's API route (routers/bidders.py) should call,
after they've merged Person 2's per-document OCR output into one combined
dict per bidder.

INPUT SHAPE - matches Person 2's confirmed OCR extraction output exactly:
    {
        "gstin":        {"value": "27AAAAA0000A1Z5", "confidence": 0.94},
        "pan":          {"value": "AAAAA0000A",       "confidence": 0.91},
        "udyam":        {"value": "UDYAM-MH-01-0012345", "confidence": 0.88},
        "company_name": {"value": "ABC Pvt Ltd",       "confidence": 0.71},
    }
A field can have "value": None if extraction failed - handled gracefully
below (produces UNVERIFIED for that check rather than crashing).

Low-confidence extractions are NOT silently trusted: below LOW_CONFIDENCE_
THRESHOLD, a field is treated the same as a missing value, and the reason
says so explicitly (an officer should see "extraction confidence too low",
not a false MISMATCH caused by a bad OCR read).
"""

from gst_service import check_gst_compliance
from pan_service import check_pan
from udyam_service import check_udyam
from blacklist_service import check_blacklist
from rule_engine import calculate_compliance
from status import result, UNVERIFIED

LOW_CONFIDENCE_THRESHOLD = 0.5


def _extract(fields: dict, key: str):
    """Pull a usable value out of Person 2's {value, confidence} shape.
    Returns None if missing OR below confidence threshold - both treated
    the same way: 'we don't trust this enough to check against it.'
    """
    field = fields.get(key) or {}
    value = field.get("value")
    confidence = field.get("confidence", 0.0)
    if value is None or confidence < LOW_CONFIDENCE_THRESHOLD:
        return None
    return value


def verify_bidder(extracted_fields: dict, expected_entity_type: str = None) -> dict:
    """
    extracted_fields: Person 2's OCR output for one bidder (see shape above),
                       already merged across their 3 documents.
    expected_entity_type: optional, e.g. "Company" - what the bid claims
                           the bidder's business structure is
    """
    company_name = _extract(extracted_fields, "company_name")
    declared_gstin = _extract(extracted_fields, "gstin")
    declared_pan = _extract(extracted_fields, "pan")
    declared_udyam = _extract(extracted_fields, "udyam")

    # --- GST ---
    if declared_gstin is None or company_name is None:
        gst_result = result(
            check_name="GST", status=UNVERIFIED, flag=True,
            reason="GSTIN or company name could not be extracted with sufficient confidence",
            source="GST Portal (cached lookup)",
        )
    else:
        gst_result = check_gst_compliance(declared_gstin, company_name)

    verified_gstin = declared_gstin if gst_result["status"] == "VERIFIED" else None

    # --- PAN ---
    if declared_pan is None:
        pan_result = result(
            check_name="PAN", status=UNVERIFIED, flag=True,
            reason="PAN could not be extracted with sufficient confidence",
            source="Local format validation",
        )
    else:
        pan_result = check_pan(
            declared_pan=declared_pan,
            expected_entity_type=expected_entity_type,
            verified_gstin=verified_gstin,
        )

    # --- Udyam ---
    if declared_udyam is None or company_name is None:
        udyam_result = result(
            check_name="Udyam", status=UNVERIFIED, flag=True,
            reason="Udyam number or company name could not be extracted with sufficient confidence",
            source="SIMULATED — sandbox dataset",
        )
    else:
        udyam_result = check_udyam(declared_udyam, company_name)

    # --- Blacklist ---
    if declared_pan is None or company_name is None:
        blacklist_result = result(
            check_name="Blacklist", status=UNVERIFIED, flag=True,
            reason="PAN or company name could not be extracted - cannot run blacklist check",
            source="SIMULATED — sandbox debarment list",
        )
    else:
        blacklist_result = check_blacklist(declared_pan, company_name)

    all_checks = [gst_result, pan_result, udyam_result, blacklist_result]
    compliance = calculate_compliance(all_checks)

    return {
        "bidder_name": company_name or "Unknown (extraction failed)",
        "checks": all_checks,
        **compliance,
    }