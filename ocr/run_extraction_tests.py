"""
run_extraction_tests.py — Person 2's track (SIH26100)

Runs extract_fields() against all documents in test_documents/ and prints
a clear pass/fail-style report. Run generate_test_documents.py first.
"""

from pathlib import Path
from extraction import extract_fields

TEST_DIR = Path("test_documents")

EXPECTED = {
    "gst_clean.png": {"gstin": "27AAAPL1234C1ZV", "company_name": "ABC Enterprises Pvt Ltd"},
    "pan_clean.png": {"pan": "AAAPL1234C"},
    "udyam_clean.png": {"udyam": "UDYAM-MH-27-0012345", "company_name": "ABC Enterprises Pvt Ltd"},
}


def run():
    if not TEST_DIR.exists():
        print(f"'{TEST_DIR}/' not found — run generate_test_documents.py first.")
        return

    images = sorted(TEST_DIR.glob("*.png"))
    if not images:
        print(f"No images found in '{TEST_DIR}/' — run generate_test_documents.py first.")
        return

    for img_path in images:
        print("=" * 70)
        print(f"FILE: {img_path.name}")
        print("=" * 70)

        result = extract_fields(str(img_path))
        for field, data in result.items():
            print(f"  {field}: {data}")

        expected = EXPECTED.get(img_path.name)
        if expected:
            print("\n  --- Sanity check vs expected ---")
            for field, expected_value in expected.items():
                actual_value = result.get(field, {}).get("value")
                match = "MATCH" if actual_value == expected_value else "MISMATCH"
                print(f"  {field}: expected={expected_value!r} actual={actual_value!r} -> {match}")
        print()


if __name__ == "__main__":
    run()