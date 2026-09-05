"""
extraction.py — Field extraction module, Person 2's track (SIH26100)

Extracts GSTIN, PAN, Udyam Registration Number, and company name from
OCR'd bidder documents.

Output schema (locked in, team-wide):
    {
        "gstin": {"value": <str|None>, "confidence": <float>},
        "pan": {"value": <str|None>, "confidence": <float>},
        "udyam": {"value": <str|None>, "confidence": <float>},
        "company_name": {"value": <str|None>, "confidence": <float>},
    }

ERROR HANDLING CONTRACT:
extract_fields() NEVER raises an exception, even for a missing file,
corrupt image, or OCR engine failure. On any such failure, it returns the
same 4-field schema with every field empty, PLUS an added top-level
"error" key (a short string describing what went wrong). Callers that
only read the 4 known fields are unaffected; callers that want to
distinguish "no fields found" from "the document itself failed to
process" can check for the presence of "error".
"""

import re
from pathlib import Path

from paddleocr import PaddleOCR

_ocr_engine = None

EMPTY_FIELD = {"value": None, "confidence": 0.0}


def _get_ocr_engine() -> PaddleOCR:
    global _ocr_engine
    if _ocr_engine is None:
        _ocr_engine = PaddleOCR(
            use_textline_orientation=True,
            lang="en",
            enable_mkldnn=False,  # required on this Windows setup — see SETUP_NOTES.md
        )
    return _ocr_engine


GSTIN_PATTERN = re.compile(r"\b(\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d])\b")
PAN_PATTERN = re.compile(r"\b([A-Z]{5}\d{4}[A-Z])\b")
UDYAM_PATTERN = re.compile(r"\b(UDYAM-[A-Z]{2}-\d{2}-\d{7})\b")

PAN_ENTITY_TYPE_MAP = {
    "P": "Individual", "C": "Company", "H": "HUF (Hindu Undivided Family)",
    "F": "Firm", "A": "Association of Persons (AOP)", "T": "Trust",
    "B": "Body of Individuals (BOI)", "L": "Local Authority",
    "J": "Artificial Juridical Person", "G": "Government",
}

NAME_LABELS = [
    "company name", "legal name", "name of business", "trade name",
    "business name", "name of the applicant", "applicant name",
    "name of enterprise", "enterprise name",
]


def _empty_result(error_message: str) -> dict:
    """Returns the full schema with every field empty, plus an "error" key
    explaining why. Used for hard failures — missing file, unreadable
    image, OCR engine crash — never for a normal 'field just wasn't found'
    case, which uses EMPTY_FIELD per-field instead."""
    return {
        "gstin": dict(EMPTY_FIELD),
        "pan": dict(EMPTY_FIELD),
        "udyam": dict(EMPTY_FIELD),
        "company_name": dict(EMPTY_FIELD),
        "error": error_message,
    }


def _validate_gstin_structure(gstin: str) -> bool:
    if not gstin or len(gstin) != 15:
        return False
    return bool(PAN_PATTERN.fullmatch(gstin[2:12]))


def _pan_entity_type(pan: str):
    if not pan or len(pan) < 4:
        return None
    return PAN_ENTITY_TYPE_MAP.get(pan[3])


def _run_ocr(image_path: str) -> list[tuple[str, float]]:
    ocr = _get_ocr_engine()
    result = ocr.predict(image_path)
    lines: list[tuple[str, float]] = []
    for res in result:
        rec_texts = res.get("rec_texts", [])
        rec_scores = res.get("rec_scores", [])
        for text, score in zip(rec_texts, rec_scores):
            lines.append((text, float(score)))
    return lines


def _find_pattern_match(lines, pattern):
    for text, score in lines:
        cleaned = text.upper().replace(" ", "")
        match = pattern.search(cleaned)
        if match:
            return match.group(1), score
    return None, 0.0


def _find_labeled_free_text(lines, labels):
    lowered = [(t.lower(), s, t) for t, s in lines]
    for i, (text_lower, score, original) in enumerate(lowered):
        for label in labels:
            if label in text_lower:
                idx = text_lower.find(label)
                remainder = original[idx + len(label):].strip(" :-\t")
                if remainder:
                    return remainder, round(score * 0.85, 2)
                if i + 1 < len(lowered):
                    next_lower, next_score, next_original = lowered[i + 1]
                    if next_original.strip():
                        return next_original.strip(), round(next_score * 0.85, 2)
    return None, 0.0


def extract_fields(image_path: str) -> dict:
    """
    Extracts GSTIN, PAN, Udyam number, and company name from a document
    image. NEVER raises — see module docstring for the error contract.
    """
    # --- Hard failure: file doesn't exist ---
    try:
        exists = Path(image_path).exists()
    except Exception as e:
        return _empty_result(f"Invalid path '{image_path}': {e}")

    if not exists:
        return _empty_result(f"File not found: {image_path}")

    # --- Hard failure: OCR engine itself fails (corrupt image, unreadable
    # format, model error, etc.) ---
    try:
        lines = _run_ocr(image_path)
    except Exception as e:
        return _empty_result(f"OCR failed on '{image_path}': {e}")

    # --- From here on, OCR succeeded — any field simply not being found
    # is normal and uses per-field EMPTY_FIELD, not a top-level error ---
    try:
        gstin_value, gstin_conf = _find_pattern_match(lines, GSTIN_PATTERN)
        if gstin_value and not _validate_gstin_structure(gstin_value):
            gstin_value, gstin_conf = None, 0.0

        pan_value, pan_conf = _find_pattern_match(lines, PAN_PATTERN)
        if gstin_value:
            embedded_pan = gstin_value[2:12]
            pan_value = embedded_pan
            pan_conf = gstin_conf

        udyam_value, udyam_conf = _find_pattern_match(lines, UDYAM_PATTERN)
        company_value, company_conf = _find_labeled_free_text(lines, NAME_LABELS)

        result = {
            "gstin": {"value": gstin_value, "confidence": round(gstin_conf, 2)},
            "pan": {"value": pan_value, "confidence": round(pan_conf, 2)},
            "udyam": {"value": udyam_value, "confidence": round(udyam_conf, 2)},
            "company_name": {
                "value": company_value,
                "confidence": round(company_conf, 2),
            },
        }

        if pan_value:
            result["pan"]["entity_type"] = _pan_entity_type(pan_value)

        return result

    except Exception as e:
        # Safety net: OCR succeeded but something in our own parsing logic
        # broke unexpectedly. Still never crash the caller.
        return _empty_result(f"Field parsing failed on '{image_path}': {e}")


if __name__ == "__main__":
    import sys
    import json

    if len(sys.argv) != 2:
        print("Usage: python extraction.py <path_to_image>")
        sys.exit(1)

    output = extract_fields(sys.argv[1])
    print(json.dumps(output, indent=2))