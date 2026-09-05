"""
run_real_documents_test.py — Person 2's track (SIH26100)

Walks Person 1's real Demo-data folder, runs extract_fields() on every
document found per bidder, merges each bidder's documents into one
record, and prints a clean summary — GSTIN/PAN/Udyam/company_name plus
any cross-document conflicts detected.

Usage:
    python run_real_documents_test.py "Demo-data-neww/Demo-data"
"""

import sys
import json
from pathlib import Path

from extraction import extract_fields
from mergeBidder import merge_bidder_documents

# Recognized document filenames per bidder folder — extend this if Person 1
# adds new document types (e.g. financial_declaration.png is intentionally
# NOT in here yet — see team note below)
DOC_FILENAMES = {
    "gst": ["gst_certificate.png", "gst_certificate.pdf"],
    "pan": ["pan_card.png", "pan_card.pdf"],
    "udyam": ["udyam_certificate.png", "udyam_certificate.pdf"],
}


def _find_doc(bidder_folder: Path, candidates: list[str]) -> Path | None:
    for name in candidates:
        candidate_path = bidder_folder / name
        if candidate_path.exists():
            return candidate_path
    return None


def run(demo_data_root: str):
    root = Path(demo_data_root)
    if not root.exists():
        print(f"Folder not found: {demo_data_root}")
        return

    bidder_folders = sorted(
        p for p in root.iterdir()
        if p.is_dir() and ("bidder" in p.name.lower())
    )

    if not bidder_folders:
        print(f"No bidder folders found under {demo_data_root}")
        return

    for bidder_folder in bidder_folders:
        print("=" * 70)
        print(f"BIDDER FOLDER: {bidder_folder.name}")
        print("=" * 70)

        gst_path = _find_doc(bidder_folder, DOC_FILENAMES["gst"])
        pan_path = _find_doc(bidder_folder, DOC_FILENAMES["pan"])
        udyam_path = _find_doc(bidder_folder, DOC_FILENAMES["udyam"])

        gst_result = extract_fields(str(gst_path)) if gst_path else None
        pan_result = extract_fields(str(pan_path)) if pan_path else None
        udyam_result = extract_fields(str(udyam_path)) if udyam_path else None

        for label, path, result in [
            ("GST cert", gst_path, gst_result),
            ("PAN card", pan_path, pan_result),
            ("Udyam cert", udyam_path, udyam_result),
        ]:
            if path is None:
                print(f"  [{label}] not found in this bidder's folder — skipped")
            else:
                print(f"  [{label}: {path.name}]")
                print(f"    {json.dumps(result)}")

        # Flag any other files in the folder we don't yet have extraction
        # logic for (e.g. financial_declaration.png) — informational only
        known_names = {n for names in DOC_FILENAMES.values() for n in names}
        other_files = [
            f.name for f in bidder_folder.iterdir()
            if f.is_file() and f.name not in known_names
        ]
        if other_files:
            print(f"  NOTE: unrecognized file(s) in this folder, not extracted: {other_files}")

        merged, conflicts, doc_errors = merge_bidder_documents(
            gst_result, pan_result, udyam_result
        )

        print("\n  --- MERGED RECORD (for verify_bidder()) ---")
        print(" ", json.dumps(merged, indent=2).replace("\n", "\n  "))

        if conflicts:
            print("\n  --- CONFLICTS DETECTED ---")
            print(" ", json.dumps(conflicts, indent=2).replace("\n", "\n  "))
        else:
            print("\n  No cross-document conflicts detected.")

        if doc_errors:
            print("\n  --- DOCUMENT ERRORS ---")
            print(" ", json.dumps(doc_errors, indent=2).replace("\n", "\n  "))

        print()


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print('Usage: python run_real_documents_test.py "path/to/Demo-data"')
        sys.exit(1)
    run(sys.argv[1])