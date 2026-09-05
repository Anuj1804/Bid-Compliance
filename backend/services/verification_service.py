"""
WIRING for Person 3's verification orchestrator — now live, not a stub.

ai-engine/services/verify_bidder.py uses FLAT imports (e.g. `from status
import result`), meaning that folder itself must be on sys.path — it's
not a proper Python package, just a folder of sibling scripts. We add it
to sys.path here, once, before importing.

REQUIRES: the `ai-engine` folder to be renamed to `ai_engine` (hyphens
are not valid in Python identifiers/paths used this way) — confirm this
rename has happened before this import will work.
"""

import sys
import os
from typing import Dict, Any, Optional

_AI_ENGINE_SERVICES = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "ai_engine", "services")
)
if _AI_ENGINE_SERVICES not in sys.path:
    sys.path.insert(0, _AI_ENGINE_SERVICES)

from verify_bidder import verify_bidder as real_verify_bidder  # noqa: E402


def run_orchestrator(extracted_data: Dict[str, Any], expected_entity_type: Optional[str] = None) -> Dict[str, Any]:
    """Thin pass-through to Person 3's real orchestrator — we don't
    reimplement any verification logic here, only call and return it."""
    return real_verify_bidder(extracted_data, expected_entity_type)