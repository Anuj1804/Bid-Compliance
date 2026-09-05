"""
Shared verification status labels — used consistently across every check.

Never mark something VERIFIED unless it came from a real external/authoritative
source. This distinction is the core honesty principle of the whole system.
"""

VERIFIED = "VERIFIED"              # confirmed against a real external source
VALIDATED = "VALIDATED"            # checked locally (format/logic) - no external authority
SIMULATED = "SIMULATED"            # sandbox/mock data, clearly labeled as such
MISMATCH = "MISMATCH"              # two sources disagree
UNVERIFIED = "UNVERIFIED"          # lookup failed / no data available


def result(check_name, status, flag, reason=None, source=None, evidence=None, severity="NORMAL"):
    """Standard shape every verification function should return."""
    return {
        "check": check_name,
        "status": status,
        "flag": flag,               # True if this needs officer attention
        "reason": reason,
        "source": source,
        "evidence": evidence or {},
        "severity": severity,       # NORMAL | HIGH | CRITICAL
    }