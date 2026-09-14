import sys
import os
from typing import Dict, Any

_OCR_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "ocr")
)
if _OCR_DIR not in sys.path:
    sys.path.insert(0, _OCR_DIR)

def extract_fields(file_path: str, document_type: str) -> Dict[str, Any]:
    from extraction import extract_fields as _real_extract
    return _real_extract(file_path)


def overall_confidence(extracted_fields: Dict[str, Any]) -> float:
    confidences = [
        v.get("confidence", 0.0)
        for v in extracted_fields.values()
        if isinstance(v, dict) and v.get("value") is not None
    ]
    return round(sum(confidences) / len(confidences), 2) if confidences else 0.0