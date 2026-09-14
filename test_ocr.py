import os, sys, json
sys.path.insert(0, os.path.abspath('backend'))
from backend.services.ocr_service import extract_fields

upload_dir = os.path.abspath('uploads')
if not os.path.exists(upload_dir):
    print("Uploads dir not found!")
else:
    files = os.listdir(upload_dir)
    if not files:
        print("No files in uploads dir!")
    else:
        for f in files:
            path = os.path.join(upload_dir, f)
            print(f"Testing file: {f}")
            res = extract_fields(path, "GST")
            print(json.dumps(res, indent=2))
            break # Just test the first one
