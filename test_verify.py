import sys, os
ROOT = os.path.abspath(os.path.dirname(__file__))
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.join(ROOT, "ai_engine", "services"))

from database.db import SessionLocal
from database.models import Bidder, Document
from backend.services import verification_service

db = SessionLocal()
# get clean_bidder_1_sundar
bidder = db.query(Bidder).filter(Bidder.company_name == "Sundar Constructions Pvt Ltd").first()
if not bidder:
    print("Bidder not found")
    sys.exit(0)

print("Testing bidder:", bidder.company_name)
documents = db.query(Document).filter(Document.bidder_id == bidder.id).all()
print("Found documents:", len(documents))
for doc in documents:
    print(f"Doc: {doc.document_type}, fields: {bool(doc.extracted_fields)}")

merged_extracted = {}
for doc in documents:
    if not doc.extracted_fields:
        continue
    for k, v in doc.extracted_fields.items():
        if k not in merged_extracted or (isinstance(v, dict) and v.get("confidence", 0) > merged_extracted.get(k, {}).get("confidence", 0)):
            merged_extracted[k] = v

result = verification_service.run_orchestrator(merged_extracted)
print("Result Score:", result.get("compliance_score"))
print("Result Risk:", result.get("risk_level"))
for check in result.get("checks", []):
    print(f"  {check.get('check')}: {check.get('status')} - {check.get('reason')}")
