"""
Rule engine - deterministic, transparent, inspectable.

This is intentionally NOT a black-box ML model. Every weight is visible
and explainable - if a judge asks "why did this bidder get 62/100",
you can point to this exact table.

IMPORTANT DISTINCTION:
An UNVERIFIED result (we simply couldn't check something - e.g. OCR
failed to extract a field) is treated as less severe than a confirmed
MISMATCH (we checked, and it's genuinely wrong/inconsistent). Both are
flagged and cost points, but a missing check should never score as badly
as a confirmed problem - otherwise a bad OCR read looks identical to a
real fraud signal, which would be misleading to the officer.
"""

# Point deduction per flagged check, when the result is a confirmed
# MISMATCH. Tune these together as a team - keep them visible/defensible,
# don't hide the reasoning.
DEDUCTIONS = {
    "GST": 25,
    "PAN": 15,
    "Udyam": 15,
    "Blacklist": 100,  # effectively zeroes the score on a confirmed match
}

# UNVERIFIED (couldn't check - e.g. missing/low-confidence extraction)
# costs half of the confirmed-mismatch deduction. Still flagged for
# officer attention, but not treated as proof of a real problem.
UNVERIFIED_DEDUCTION_FACTOR = 0.5

BASE_SCORE = 100


def calculate_compliance(check_results: list) -> dict:
    """
    check_results: list of result() dicts from the individual services
    (gst_service, pan_service, udyam_service, blacklist_service)
    """
    score = BASE_SCORE
    critical_hit = False
    breakdown = []

    for check in check_results:
        deduction = 0

        if check["flag"]:
            base_deduction = DEDUCTIONS.get(check["check"], 10)

            if check["status"] == "UNVERIFIED":
                # We couldn't check - not the same as a confirmed problem.
                deduction = round(base_deduction * UNVERIFIED_DEDUCTION_FACTOR)
            else:
                # Confirmed MISMATCH - full deduction applies.
                deduction = base_deduction
                if check.get("severity") == "CRITICAL":
                    critical_hit = True

            score -= deduction

        breakdown.append({
            "check": check["check"],
            "status": check["status"],
            "flag": check["flag"],
            "deduction": deduction,
            "reason": check.get("reason"),
        })

    score = max(0, score)

    if critical_hit:
        risk_level = "HIGH"
    elif score >= 80:
        risk_level = "LOW"
    elif score >= 50:
        risk_level = "MEDIUM"
    else:
        risk_level = "HIGH"

    return {
        "compliance_score": score,
        "risk_level": risk_level,
        "breakdown": breakdown,
        "recommendation": _recommendation_text(score, risk_level, critical_hit),
    }


def _recommendation_text(score: int, risk_level: str, critical_hit: bool) -> str:
    if critical_hit:
        return "Critical issue found (e.g. blacklist match) — recommend immediate review before proceeding."
    if risk_level == "LOW":
        return "No significant issues found. Recommend proceeding to financial evaluation."
    if risk_level == "MEDIUM":
        return "Some inconsistencies found — recommend officer review before qualification."
    return "Multiple or serious issues found — recommend detailed review before qualification."