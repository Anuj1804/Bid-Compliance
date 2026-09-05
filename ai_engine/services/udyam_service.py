"""
Udyam/MSME registration check - STATUS: SIMULATED (sandbox data).

We don't have authorized access to the live Udyam portal, so this checks
against a small, realistic mock dataset built for the demo. Clearly
labeled as sandbox everywhere it's shown - never presented as a real
government lookup.

In production, this connector would be swapped for an authorized
integration with the official Udyam verification portal.
"""

import json
import os
import re

from status import result, SIMULATED, MISMATCH
from name_match import names_match

SANDBOX_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "udyam_sandbox.json")
UDYAM_PATTERN = re.compile(r"^UDYAM-[A-Z]{2}-\d{2}-\d{7}$")


def _load_sandbox() -> dict:
    with open(SANDBOX_PATH) as f:
        return json.load(f)


def validate_udyam_format(udyam_number: str) -> bool:
    return bool(UDYAM_PATTERN.match(udyam_number))


def check_udyam(udyam_number: str, declared_name: str) -> dict:
    if not validate_udyam_format(udyam_number):
        return result(
            check_name="Udyam",
            status=MISMATCH,
            flag=True,
            reason=f"Udyam number '{udyam_number}' does not match valid format",
            source="SIMULATED — sandbox dataset",
        )

    sandbox = _load_sandbox()
    record = sandbox.get(udyam_number)

    if record is None:
        return result(
            check_name="Udyam",
            status=SIMULATED,
            flag=True,
            reason="Udyam number not found in sandbox dataset",
            source="SIMULATED — sandbox dataset (production: official Udyam portal)",
        )

    if record["status"] != "Active":
        return result(
            check_name="Udyam",
            status=MISMATCH,
            flag=True,
            severity="HIGH",
            reason=f"Udyam registration status is '{record['status']}', not Active",
            source="SIMULATED — sandbox dataset",
            evidence=record,
        )

    if not names_match(declared_name, record["enterprise_name"]):
        return result(
            check_name="Udyam",
            status=MISMATCH,
            flag=True,
            severity="HIGH",
            reason=f"Declared name does not match Udyam enterprise name '{record['enterprise_name']}'",
            source="SIMULATED — sandbox dataset",
            evidence=record,
        )

    return result(
        check_name="Udyam",
        status=SIMULATED,
        flag=False,
        reason="Found in sandbox, Active, name matches",
        source="SIMULATED — sandbox dataset (production: official Udyam portal)",
        evidence=record,
    )