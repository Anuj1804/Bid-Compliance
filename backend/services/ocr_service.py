"""
STUB for Person 2's OCR/extraction module.

Replace `extract_fields()` with an import of their actual function once
they hand it off — the return shape below is the contract from the team
brief, so as long as their real function returns this shape, nothing else
in the codebase needs to change.
"""

from typing import Dict, Any


def extract_fields(file_path: str, document_type: str) -> Dict[str, Any]:
    """
    TODO: replace this stub with Person 2's real OCR extraction call, e.g.:
        from ai_engine.ocr import extract_fields as real_extract_fields
        return real_extract_fields(file_path, document_type)
    """
    # Stub response matches the exact shape in the team brief so downstream
    # code (routes, verification orchestrator call) can be built/tested now.
    return {
        "gstin": {"value": None, "confidence": 0.0},
        "pan": {"value": None, "confidence": 0.0},
        "udyam": {"value": None, "confidence": 0.0},
        "company_name": {"value": None, "confidence": 0.0},
    }


def overall_confidence(extracted_fields: Dict[str, Any]) -> float:
    """Average confidence across extracted fields, for the documents.extraction_confidence column."""
    confidences = [
        v.get("confidence", 0.0)
        for v in extracted_fields.values()
        if isinstance(v, dict) and v.get("value") is not None
    ]
    return round(sum(confidences) / len(confidences), 2) if confidences else 0.0