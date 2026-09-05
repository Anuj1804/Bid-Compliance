"""
test_merge_clean.py — Person 2's track (SIH26100)

Confirms merge_bidder_documents() produces a correct, conflict-free record
when a bidder's 3 documents are all consistent (the "happy path") —
complementing the earlier flagged-bidder test, which proved the
conflict-detection path works.
"""

import json
from extraction import extract_fields
from mergeBidder import merge_bidder_documents

EXPECTED_MERGED = {
    "gstin": "27AAAPL1234C1ZV",
    "pan": "AAAPL1234C",
    "udyam": "UDYAM-MH-27-0012345",
    "company_name": "ABC Enterprises Pvt Ltd",
}


def run():
    print("Extracting all 3 documents for the CLEAN bidder...")
    gst_result = extract_fields("test_documents/gst_clean.png")
    pan_result = extract_fields("test_documents/pan_clean.png")
    udyam_result = extract_fields("test_documents/udyam_clean.png")

    merged, conflicts, doc_errors = merge_bidder_documents(
        gst_result, pan_result, udyam_result
    )

    print("\n" + "=" * 60)
    print("MERGED RECORD")
    print("=" * 60)
    print(json.dumps(merged, indent=2))

    print("\n" + "=" * 60)
    print("SANITY CHECK vs EXPECTED")
    print("=" * 60)
    all_correct = True
    for field, expected_value in EXPECTED_MERGED.items():
        actual_value = merged[field]["value"]
        match = actual_value == expected_value
        all_correct = all_correct and match
        status = "MATCH" if match else "MISMATCH"
        print(f"  {field}: expected={expected_value!r} actual={actual_value!r} -> {status}")

    print("\n" + "=" * 60)
    print("CONFLICT CHECK (should be empty for a clean bidder)")
    print("=" * 60)
    if conflicts:
        print(f"  UNEXPECTED: {len(conflicts)} conflict(s) found on a clean bidder!")
        print(json.dumps(conflicts, indent=2))
        all_correct = False
    else:
        print("  No conflicts detected. Correct.")

    print("\n" + "=" * 60)
    print("DOC ERROR CHECK (should be empty — all 3 files exist and are readable)")
    print("=" * 60)
    if doc_errors:
        print(f"  UNEXPECTED: doc errors found: {doc_errors}")
        all_correct = False
    else:
        print("  No document errors. Correct.")

    print("\n" + "=" * 60)
    print("OVERALL RESULT:", "PASS" if all_correct else "FAIL")
    print("=" * 60)


if __name__ == "__main__":
    run()