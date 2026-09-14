import sys
import os

ROOT = os.path.abspath(os.path.dirname(__file__))
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.join(ROOT, "ocr"))

from ocr.extraction import extract_fields

docs = [
    "datasets/clean_bidder_1_sundar/gst_certificate.png",
    "datasets/clean_bidder_1_sundar/pan_card.png",
    "datasets/clean_bidder_1_sundar/udyam_certificate.png"
]

merged_seed = {}
for path in docs:
    extracted = extract_fields(os.path.join(ROOT, path))
    for k, v in extracted.items():
        if k not in merged_seed or (v and v.get("confidence", 0) > merged_seed.get(k, {}).get("confidence", 0)):
            merged_seed[k] = v

merged_api = {}
for path in docs:
    doc_extracted = extract_fields(os.path.join(ROOT, path))
    # simulate the new API logic
    if not doc_extracted: continue
    for k, v in doc_extracted.items():
        if k not in merged_api or (isinstance(v, dict) and v.get("confidence", 0) > merged_api.get(k, {}).get("confidence", 0)):
            merged_api[k] = v

print("SEED:", merged_seed)
print("API: ", merged_api)
if merged_seed == merged_api:
    print("Match!")
else:
    print("Mismatch!")
