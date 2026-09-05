"""
extraction.py — Field extraction module, Person 2's track (SIH26100)

Extracts GSTIN, PAN, Udyam Registration Number, and company name from
bidder documents (image files via PaddleOCR, or PDFs with a text layer,
with an OCR fallback for scanned PDFs).

Output schema (locked in, team-wide):
    {
        "gstin": {"value": <str|None>, "confidence": <float>},
        "pan": {"value": <str|None>, "confidence": <float>},
        "udyam": {"value": <str|None>, "confidence": <float>},
        "company_name": {"value": <str|None>, "confidence": <float>},
    }

ERROR HANDLING CONTRACT:
extract_fields() NEVER raises. Missing file, corrupt file, or an OCR/PDF
read failure return the full schema with every field empty plus a
top-level "error" string. A normal "field not found" uses per-field
{"value": None, "confidence": 0.0} with no "error" key.

DESIGN NOTE — OCR character-confusion correction:
Real-world testing against Person 1's sample documents showed OCR
misreading digit '0' as letter 'O' (e.g. "24AALCT0864B1ZK" read as
"24AALCTO864B1ZK"). Since GSTIN/PAN have a fixed, known character shape,
a single misread character is corrected position-by-position (only where
the format requires a specific type) and re-validated — accepted only if
the corrected value satisfies the strict format, with a confidence
penalty (x0.7) since a correction was needed rather than a clean read.

DESIGN NOTE — matching does NOT strip spaces before searching:
A space is itself a valid word-boundary character. Stripping it (an
earlier version of this code did) can merge a label directly onto its
value (e.g. "GSTIN 24AALCT0864B1ZK" -> "GSTIN24AALCT0864B1ZK"),
destroying the \\b boundary the pattern needs. Real documents using
space-separated table layouts (not colons) surfaced this directly. A
stripped-text pass is kept only as a last-resort fallback for the rarer
case of a stray space genuinely inserted inside an ID by OCR.

DESIGN NOTE — company_name extraction:
1. Checks trade/operating-name labels FIRST, "legal name" only as a
   fallback — a GST certificate's "Legal Name" can legitimately differ
   from the "Trade Name" the business actually operates under (and which
   the PAN card / Udyam certificate list), so preferring Legal Name would
   make every clean bidder look like a false cross-document mismatch.
2. Rejects a candidate value that is actually just another field's label
   (e.g. Person 1's Udyam certificate has no detected value between the
   "Enterprise Name" and "Type of Enterprise" labels — an earlier version
   wrongly returned "Type of Enterprise" as if it were the company name).
   Correctly returning None here is the right outcome, not a regression —
   it reflects what OCR actually found, per this project's honesty rules.
3. Reconstructs a name that wraps across two lines with the label
   sandwiched in between (seen on a long company name where the OCR
   reading order put the value's first line before its own label). This
   ONLY triggers when the value immediately after the label is a bare
   corporate-suffix word (e.g. "Limited", "Pvt") — a specific, strong
   signal of a wrapped continuation, not any arbitrary preceding line.
"""

import re
from pathlib import Path

from paddleocr import PaddleOCR

_ocr_engine = None

EMPTY_FIELD = {"value": None, "confidence": 0.0}

NAME_LABEL_PRIORITY = [
    "trade name", "business name", "enterprise name", "name of enterprise",
    "company name", "applicant name", "name of the applicant",
    "name of business", "legal name", "name",
]

# Every field label seen across document templates so far — used to
# reject a candidate value that is actually just another label
KNOWN_LABELS = set(NAME_LABEL_PRIORITY) | {
    "pan", "gstin", "entity type", "date of incorporation",
    "date of registration", "registration date", "status", "state",
    "address", "udyam registration number", "type of enterprise",
    "major activity", "udyam registration details", "pan details",
    "gst registration details", "prepared for demonstration",
}

# Bare corporate-suffix words — the specific signal used to detect a
# wrapped (multi-line) company name, see design note above
NAME_SUFFIX_WORDS = {
    "limited", "ltd", "pvt", "private", "inc", "incorporated",
    "corp", "corporation", "llp", "co", "company",
}

GSTIN_PATTERN = re.compile(r"\b(\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d])\b")
PAN_PATTERN = re.compile(r"\b([A-Z]{5}\d{4}[A-Z])\b")
UDYAM_PATTERN = re.compile(r"\b(UDYAM-[A-Z]{2}-\d{2}-\d{7})\b")

GSTIN_SHAPE = "DD" + "L" * 5 + "D" * 4 + "L" + "." + "L" + "."
PAN_SHAPE = "L" * 5 + "D" * 4 + "L"

LETTER_TO_DIGIT = {"O": "0", "I": "1", "S": "5", "B": "8"}
DIGIT_TO_LETTER = {"0": "O", "1": "I", "5": "S", "8": "B"}

PAN_ENTITY_TYPE_MAP = {
    "P": "Individual", "C": "Company", "H": "HUF (Hindu Undivided Family)",
    "F": "Firm", "A": "Association of Persons (AOP)", "T": "Trust",
    "B": "Body of Individuals (BOI)", "L": "Local Authority",
    "J": "Artificial Juridical Person", "G": "Government",
}


def _get_ocr_engine() -> PaddleOCR:
    global _ocr_engine
    if _ocr_engine is None:
        _ocr_engine = PaddleOCR(
            use_textline_orientation=True,
            lang="en",
            enable_mkldnn=False,  # required on this Windows setup — see SETUP_NOTES.md
        )
    return _ocr_engine


def _empty_result(error_message: str) -> dict:
    return {
        "gstin": dict(EMPTY_FIELD),
        "pan": dict(EMPTY_FIELD),
        "udyam": dict(EMPTY_FIELD),
        "company_name": dict(EMPTY_FIELD),
        "error": error_message,
    }


def _correct_ocr_confusions(candidate: str, shape: str) -> str:
    result = list(candidate)
    for i, req in enumerate(shape):
        if i >= len(result):
            break
        ch = result[i]
        if req == "D" and ch in LETTER_TO_DIGIT:
            result[i] = LETTER_TO_DIGIT[ch]
        elif req == "L" and ch in DIGIT_TO_LETTER:
            result[i] = DIGIT_TO_LETTER[ch]
    return "".join(result)


def _validate_gstin_structure(gstin: str) -> bool:
    if not gstin or len(gstin) != 15:
        return False
    return bool(PAN_PATTERN.fullmatch(gstin[2:12]))


def _pan_entity_type(pan: str):
    if not pan or len(pan) < 4:
        return None
    return PAN_ENTITY_TYPE_MAP.get(pan[3])


def _run_ocr_on_image(image_path: str) -> list[tuple[str, float]]:
    ocr = _get_ocr_engine()
    result = ocr.predict(image_path)
    lines: list[tuple[str, float]] = []
    for res in result:
        rec_texts = res.get("rec_texts", [])
        rec_scores = res.get("rec_scores", [])
        for text, score in zip(rec_texts, rec_scores):
            lines.append((text, float(score)))
    return lines


def _extract_pdf_text_lines(pdf_path: str) -> list[tuple[str, float]] | None:
    import pdfplumber

    lines: list[tuple[str, float]] = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                for raw_line in text.split("\n"):
                    if raw_line.strip():
                        lines.append((raw_line, 1.0))

    total_chars = sum(len(t) for t, _ in lines)
    if total_chars < 15:
        return None
    return lines


def _render_pdf_to_ocr_lines(pdf_path: str) -> list[tuple[str, float]]:
    import fitz  # PyMuPDF

    all_lines: list[tuple[str, float]] = []
    doc = fitz.open(pdf_path)
    try:
        for page_index in range(len(doc)):
            page = doc[page_index]
            pix = page.get_pixmap(dpi=300)
            temp_image_path = f"{pdf_path}_page{page_index}.png"
            pix.save(temp_image_path)
            try:
                all_lines.extend(_run_ocr_on_image(temp_image_path))
            finally:
                Path(temp_image_path).unlink(missing_ok=True)
    finally:
        doc.close()
    return all_lines


def _get_lines_for_file(file_path: str) -> list[tuple[str, float]]:
    suffix = Path(file_path).suffix.lower()
    if suffix == ".pdf":
        text_lines = _extract_pdf_text_lines(file_path)
        if text_lines is not None:
            return text_lines
        return _render_pdf_to_ocr_lines(file_path)
    return _run_ocr_on_image(file_path)


def _find_pattern_match(lines, pattern):
    """Does NOT strip spaces before matching — see module docstring."""
    for text, score in lines:
        cleaned = text.upper()
        match = pattern.search(cleaned)
        if match:
            return match.group(1), score
    return None, 0.0


def _find_pattern_match_with_correction(lines, pattern, shape, expected_length):
    value, conf = _find_pattern_match(lines, pattern)
    if value:
        return value, conf, False

    token_pattern = re.compile(rf"\b([A-Z0-9]{{{expected_length}}})\b")
    for text, score in lines:
        cleaned = text.upper()
        for match in token_pattern.finditer(cleaned):
            candidate = match.group(1)
            corrected = _correct_ocr_confusions(candidate, shape)
            if pattern.fullmatch(corrected):
                return corrected, round(score * 0.7, 2), True

    # Last-resort fallback: rarer case of a stray space genuinely inside an ID
    for text, score in lines:
        stripped = text.upper().replace(" ", "")
        for match in token_pattern.finditer(stripped):
            candidate = match.group(1)
            corrected = _correct_ocr_confusions(candidate, shape)
            if pattern.fullmatch(corrected):
                return corrected, round(score * 0.5, 2), True
    return None, 0.0, False


def _looks_like_label(text_lower: str) -> bool:
    return any(lbl in text_lower for lbl in KNOWN_LABELS)


def _find_labeled_free_text(lines, label_priority, already_extracted=None):
    """See module docstring's company_name design note for the full
    rationale behind each check here."""
    already_extracted = already_extracted or set()
    lowered = [(t.lower(), s, t) for t, s in lines]

    for label in label_priority:
        for i, (text_lower, score, original) in enumerate(lowered):
            if label not in text_lower:
                continue

            idx = text_lower.find(label)
            remainder = original[idx + len(label):].strip(" :-\t")

            after_value, after_score = None, None
            if remainder:
                after_value, after_score = remainder, score
            elif i + 1 < len(lowered):
                next_lower, next_score, next_original = lowered[i + 1]
                candidate = next_original.strip()
                # Reject a "next line" that is actually just another
                # field's label (Person 1's Udyam cert has exactly this:
                # "Enterprise Name" is immediately followed by the next
                # row's "Type of Enterprise" label, with no detected value
                # in between at all)
                if candidate and not _looks_like_label(next_lower):
                    after_value, after_score = candidate, next_score

            if after_value is None:
                continue  # nothing usable at this occurrence, try elsewhere

            combined_value, combined_score = after_value, after_score

            # Wrapped-name reconstruction: ONLY when the found value is a
            # bare corporate-suffix word — a specific, strong signal that
            # this is the tail of a name whose first line landed before
            # its own label (not just any preceding line's content)
            if after_value.strip().lower() in NAME_SUFFIX_WORDS and i - 1 >= 0:
                prev_lower, prev_score, prev_original = lowered[i - 1]
                prev_stripped = prev_original.strip()
                if (prev_stripped
                        and not _looks_like_label(prev_lower)
                        and prev_stripped not in already_extracted):
                    combined_value = f"{prev_stripped} {after_value}"
                    combined_score = min(after_score, prev_score)

            return combined_value, round(combined_score * 0.85, 2)

    return None, 0.0


def extract_fields(file_path: str) -> dict:
    """
    Extracts GSTIN, PAN, Udyam number, and company name from a bidder
    document. NEVER raises — see module docstring for the error contract.
    """
    try:
        exists = Path(file_path).exists()
    except Exception as e:
        return _empty_result(f"Invalid path '{file_path}': {e}")

    if not exists:
        return _empty_result(f"File not found: {file_path}")

    try:
        lines = _get_lines_for_file(file_path)
    except Exception as e:
        return _empty_result(f"Failed to read '{file_path}': {e}")

    try:
        gstin_value, gstin_conf, gstin_corrected = _find_pattern_match_with_correction(
            lines, GSTIN_PATTERN, GSTIN_SHAPE, 15
        )
        if gstin_value and not _validate_gstin_structure(gstin_value):
            gstin_value, gstin_conf = None, 0.0

        pan_value, pan_conf, pan_corrected = _find_pattern_match_with_correction(
            lines, PAN_PATTERN, PAN_SHAPE, 10
        )
        if gstin_value:
            pan_value = gstin_value[2:12]
            pan_conf = gstin_conf
            pan_corrected = gstin_corrected

        udyam_value, udyam_conf = _find_pattern_match(lines, UDYAM_PATTERN)

        already_extracted = {v for v in (gstin_value, pan_value, udyam_value) if v}
        company_value, company_conf = _find_labeled_free_text(
            lines, NAME_LABEL_PRIORITY, already_extracted
        )

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
        if gstin_corrected:
            result["gstin"]["ocr_corrected"] = True
        if pan_corrected:
            result["pan"]["ocr_corrected"] = True

        return result

    except Exception as e:
        return _empty_result(f"Field parsing failed on '{file_path}': {e}")


if __name__ == "__main__":
    import sys
    import json

    if len(sys.argv) != 2:
        print("Usage: python extraction.py <path_to_image_or_pdf>")
        sys.exit(1)

    output = extract_fields(sys.argv[1])
    print(json.dumps(output, indent=2))