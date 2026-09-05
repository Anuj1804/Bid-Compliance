"""
PAN validation - STATUS: local validation only, never claims full verification.

We deliberately do NOT claim "PAN Verified" - that would require an
authorized KYC-grade API we don't have as a student team. Instead we:
  1. Validate the format
  2. Decode the entity type from the 4th character
  3. Cross-check against the PAN embedded in an already-VERIFIED GSTIN
     (GSTIN characters 3-12 are literally the linked PAN - this gives a
     real cross-validation without needing a dedicated PAN API)
"""

import re

from status import result, VALIDATED, MISMATCH

PAN_PATTERN = re.compile(r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$")

ENTITY_TYPE_MAP = {
    "P": "Individual",
    "C": "Company",
    "H": "HUF",
    "F": "Firm",
    "A": "AOP",
    "T": "Trust",
    "B": "Body of Individuals",
    "L": "Local Authority",
    "J": "Artificial Juridical Person",
    "G": "Government",
}


def validate_pan_format(pan: str) -> bool:
    return bool(PAN_PATTERN.match(pan))


def get_pan_entity_type(pan: str) -> str:
    if len(pan) < 4:
        return "Unknown"
    return ENTITY_TYPE_MAP.get(pan[3], "Unknown")


def cross_check_pan_with_gstin(declared_pan: str, verified_gstin: str) -> dict:
    """GSTIN chars 3-12 (0-indexed 2:12) are the linked PAN."""
    if not verified_gstin or len(verified_gstin) < 12:
        return {"checked": False}

    embedded_pan = verified_gstin[2:12]
    return {
        "checked": True,
        "match": declared_pan == embedded_pan,
        "embedded_pan": embedded_pan,
    }


def check_pan(declared_pan: str, expected_entity_type: str = None, verified_gstin: str = None) -> dict:
    if not validate_pan_format(declared_pan):
        return result(
            check_name="PAN",
            status=MISMATCH,
            flag=True,
            reason=f"PAN '{declared_pan}' does not match valid format",
            source="Local format validation",
        )

    entity_type = get_pan_entity_type(declared_pan)
    evidence = {"entity_type": entity_type}

    flag = False
    reasons = ["Format valid"]

    if expected_entity_type and entity_type != expected_entity_type:
        flag = True
        reasons.append(
            f"Entity type mismatch: PAN indicates '{entity_type}', bid declares '{expected_entity_type}'"
        )

    if verified_gstin:
        cross_check = cross_check_pan_with_gstin(declared_pan, verified_gstin)
        evidence["gstin_cross_check"] = cross_check
        if cross_check.get("checked") and not cross_check.get("match"):
            flag = True
            reasons.append("PAN does not match PAN embedded in verified GSTIN")
        elif cross_check.get("checked"):
            reasons.append("Matches PAN embedded in verified GSTIN")

    return result(
        check_name="PAN",
        status=VALIDATED,
        flag=flag,
        severity="HIGH" if flag else "NORMAL",
        reason=" | ".join(reasons),
        source="Local format validation + GSTIN cross-reference",
        evidence=evidence,
    )