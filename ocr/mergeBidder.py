"""
merge_bidder.py — Person 2's track (SIH26100)

Merges extract_fields() output from a bidder's 3 separate documents
(GST certificate, PAN card, Udyam certificate) into the single flat record
Person 3's verify_bidder() expects.

Returns THREE things now (updated for error-handling):
  1. `merged`    — the flat {"gstin", "pan", "udyam", "company_name"} dict,
                   ready to pass directly into verify_bidder()
  2. `conflicts` — any field where two source documents disagree (e.g. a
                   PAN card showing a different PAN than the one embedded
                   in the GSTIN) — feeds the cross-document consistency
                   check so the disagreement isn't silently lost
  3. `doc_errors`— any of the 3 input documents that failed to process
                   entirely (missing file, corrupt image, OCR crash) rather
                   than just "field not found". Distinct from a conflict:
                   a conflict means both documents WERE read but disagree;
                   a doc_error means one document couldn't be read at all,
                   so its fields are trivially empty and shouldn't be
                   mistaken for "this bidder simply has no PAN".
"""

EMPTY_FIELD = {"value": None, "confidence": 0.0}


def _field(extraction: dict | None, key: str) -> dict:
    if extraction is None:
        return dict(EMPTY_FIELD)
    return extraction.get(key, dict(EMPTY_FIELD))


def merge_bidder_documents(
    gst_extraction: dict | None,
    pan_extraction: dict | None,
    udyam_extraction: dict | None,
) -> tuple[dict, list, dict]:
    """
    Args: the extract_fields() output for each of a bidder's 3 documents.
    Pass None for any document that wasn't submitted at all.

    Returns: (merged, conflicts, doc_errors)
    """
    conflicts = []
    doc_errors = {}

    # Surface any document that failed hard (see extraction.py's error
    # contract — an "error" key means the document itself couldn't be
    # processed, not just "field wasn't found").
    for doc_name, extraction in [
        ("gst_certificate", gst_extraction),
        ("pan_card", pan_extraction),
        ("udyam_certificate", udyam_extraction),
    ]:
        if extraction is not None and "error" in extraction:
            doc_errors[doc_name] = extraction["error"]

    # --- GSTIN ---
    gstin = _field(gst_extraction, "gstin")

    # --- PAN: PAN card authoritative, GST-embedded PAN as fallback ---
    pan_from_card = _field(pan_extraction, "pan")
    pan_from_gst = _field(gst_extraction, "pan")

    if pan_from_card["value"] is not None and pan_from_gst["value"] is not None:
        if pan_from_card["value"] != pan_from_gst["value"]:
            conflicts.append({
                "field": "pan",
                "sources": {
                    "pan_card": pan_from_card,
                    "gst_certificate": pan_from_gst,
                },
            })
        pan = pan_from_card
    elif pan_from_card["value"] is not None:
        pan = pan_from_card
    elif pan_from_gst["value"] is not None:
        pan = pan_from_gst
    else:
        pan = dict(EMPTY_FIELD)

    # --- Udyam ---
    udyam = _field(udyam_extraction, "udyam")

    # --- Company name: check all 3 sources for disagreement ---
    name_candidates = {
        "gst_certificate": _field(gst_extraction, "company_name"),
        "pan_card": _field(pan_extraction, "company_name"),
        "udyam_certificate": _field(udyam_extraction, "company_name"),
    }
    found_names = {
        source: data for source, data in name_candidates.items()
        if data["value"] is not None
    }

    if found_names:
        distinct_values = {data["value"] for data in found_names.values()}
        if len(distinct_values) > 1:
            conflicts.append({"field": "company_name", "sources": found_names})
        company_name = max(found_names.values(), key=lambda d: d["confidence"])
    else:
        company_name = dict(EMPTY_FIELD)

    merged = {
        "gstin": gstin,
        "pan": pan,
        "udyam": udyam,
        "company_name": company_name,
    }

    return merged, conflicts, doc_errors


if __name__ == "__main__":
    import json
    from extraction import extract_fields

    gst_result = extract_fields("test_documents/gst_flagged.png")
    pan_result = extract_fields("test_documents/pan_flagged.png")
    udyam_result = extract_fields("test_documents/udyam_flagged.png")

    merged, conflicts, doc_errors = merge_bidder_documents(
        gst_result, pan_result, udyam_result
    )

    print("MERGED (pass this to verify_bidder()):")
    print(json.dumps(merged, indent=2))
    print("\nCONFLICTS (feed this to the cross-document consistency check):")
    print(json.dumps(conflicts, indent=2))
    print("\nDOC ERRORS (documents that failed to process at all):")
    print(json.dumps(doc_errors, indent=2))

    # --- Demonstrate the missing-file case ---
    print("\n" + "=" * 60)
    print("Demo: what happens with a missing document file")
    print("=" * 60)
    broken_result = extract_fields("this_file_does_not_exist.png")
    print("extract_fields() on a missing file (no crash):")
    print(json.dumps(broken_result, indent=2))