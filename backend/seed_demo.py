"""
seed_demo.py
Run once from the project root:  python backend/seed_demo.py
Checks for existing data — safe to re-run.
"""

import sys, os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.join(ROOT, "ocr"))
sys.path.insert(0, os.path.join(ROOT, "ai_engine", "services"))

from database.db import SessionLocal, engine, Base
from database.models import Tender, Bidder, Document, VerificationResult, Flag, AuditLog, User
from backend.services.auth_service import hash_password
from extraction import extract_fields
from verify_bidder import verify_bidder

Base.metadata.create_all(bind=engine)
db = SessionLocal()


def seed_user():
    if db.query(User).filter(User.username == "officer1").first():
        print("  ✓ User officer1 already exists")
        return
    db.add(User(username="officer1", hashed_password=hash_password("password123"), role="officer"))
    db.add(User(username="admin1",   hashed_password=hash_password("admin123"),    role="admin"))
    db.commit()
    print("  ✓ Created: officer1/password123  and  admin1/admin123")


def seed_tender(title, description, checks, doc_path):
    existing = db.query(Tender).filter(Tender.title == title).first()
    if existing:
        print(f"  ✓ Tender '{title}' exists (id={existing.id})")
        return existing
    t = Tender(title=title, description=description, required_checks=checks,
               document_path=os.path.join(ROOT, "datasets", doc_path))
    db.add(t); db.commit(); db.refresh(t)
    print(f"  ✓ Created tender '{title}' (id={t.id})")
    return t


def seed_bidder(tender_id, company_name, folder, doc_files):
    if db.query(Bidder).filter(Bidder.company_name == company_name,
                                Bidder.tender_id == tender_id).first():
        print(f"  ✓ Bidder '{company_name}' exists — skip")
        return

    print(f"\n  ► {company_name}")
    datasets_root = os.path.join(ROOT, "datasets", folder)
    merged, doc_rows = {}, []

    for filename, doc_type in doc_files:
        path = os.path.join(datasets_root, filename)
        if not os.path.exists(path):
            print(f"    ⚠  Not found: {path}")
            continue
        print(f"    OCR: {filename} ...", end=" ", flush=True)
        extracted = extract_fields(path)
        gstin = (extracted.get("gstin") or {}).get("value")
        name  = (extracted.get("company_name") or {}).get("value")
        print(f"GSTIN={gstin}  Name={name}")
        doc_rows.append((path, doc_type, extracted))
        for k, v in extracted.items():
            if k not in merged or (v and v.get("confidence", 0) > merged.get(k, {}).get("confidence", 0)):
                merged[k] = v

    declared_gstin = (merged.get("gstin")   or {}).get("value")
    declared_pan   = (merged.get("pan")     or {}).get("value")
    declared_udyam = (merged.get("udyam")   or {}).get("value")

    bidder = Bidder(tender_id=tender_id, company_name=company_name,
                    declared_gstin=declared_gstin, declared_pan=declared_pan,
                    declared_udyam=declared_udyam)
    db.add(bidder); db.commit(); db.refresh(bidder)

    for path, doc_type, extracted in doc_rows:
        confs = [v.get("confidence", 0.0) for v in extracted.values()
                 if isinstance(v, dict) and v.get("value") is not None]
        avg_conf = round(sum(confs) / len(confs), 2) if confs else 0.0
        db.add(Document(bidder_id=bidder.id, document_type=doc_type,
                        file_path=path, extracted_fields=extracted,
                        extraction_confidence=avg_conf))
    db.commit()

    db.add(AuditLog(bidder_id=bidder.id, event_type="DOCUMENT_UPLOADED",
                    actor="SYSTEM/seed",
                    details=f"{len(doc_rows)} documents processed by seed script"))
    db.commit()

    print(f"    Running AI verification ...", end=" ", flush=True)
    try:
        result = verify_bidder(merged)
    except Exception as e:
        print(f"ERROR: {e}"); return

    score  = result.get("compliance_score", 0)
    risk   = result.get("risk_level", "HIGH")
    rec    = result.get("recommendation", "")
    checks = result.get("checks", [])
    flags  = sum(1 for c in checks if c.get("flag"))
    print(f"Score={score}  Risk={risk}  Flags={flags}")

    vr = VerificationResult(bidder_id=bidder.id, compliance_score=score,
                             risk_level=risk, recommendation=rec, checks=checks)
    db.add(vr); db.commit()

    for check in checks:
        if check.get("flag"):
            db.add(Flag(bidder_id=bidder.id, check_type=check.get("check","?"),
                        status="open", severity=check.get("severity"),
                        reason=check.get("reason"),
                        declared_value=declared_gstin if check.get("check") == "GST" else
                                       declared_pan   if check.get("check") == "PAN" else
                                       declared_udyam,
                        verified_value=str(check.get("evidence", {}).get("lgnm") or
                                          check.get("evidence", {}).get("enterprise_name") or "")))
    db.commit()

    db.add(AuditLog(bidder_id=bidder.id, event_type="SCORE_CALCULATED",
                    actor="SYSTEM/seed",
                    details=f"Score={score}, Risk={risk}", new_state=result))
    db.commit()
    print(f"    ✓ Saved (id={bidder.id})")


if __name__ == "__main__":
    print("\n===== BID COMPLIANCE DEMO SEED =====\n")

    print("[1] Users")
    seed_user()

    print("\n[2] Tenders")
    ta = seed_tender("Infrastructure Development & Civil Works",
                     "GeM tender for road infrastructure and civil construction.",
                     ["GST","PAN","Udyam","Blacklist"], "tender_A.png")
    tb = seed_tender("Supply Chain & Procurement Services",
                     "GeM tender for industrial supply chain and procurement.",
                     ["GST","PAN","Udyam","Blacklist"], "tender_B.png")
    tc = seed_tender("Technology Solutions & IT Services",
                     "GeM tender for software solutions and IT infrastructure.",
                     ["GST","PAN","Blacklist"], "tender_C.png")

    print("\n[3] Clean bidders")
    seed_bidder(ta.id, "Sundar Constructions Pvt Ltd",  "clean_bidder_1_sundar",
                [("gst_certificate.png","GST"),("pan_card.png","PAN"),("udyam_certificate.png","Udyam")])
    seed_bidder(ta.id, "Karthik Engineering Works",     "clean_bidder_2_karthik",
                [("gst_certificate.png","GST"),("pan_card.png","PAN"),("udyam_certificate.png","Udyam")])
    seed_bidder(tb.id, "Vignesh Supply Solutions",      "clean_bidder_3_vignesh",
                [("gst_certificate.png","GST"),("pan_card.png","PAN"),("udyam_certificate.png","Udyam")])

    print("\n[4] Flagged bidders")
    seed_bidder(ta.id, "Rajesh Contractors",            "flagged_bidder_1_rajesh",
                [("gst_certificate.png","GST"),("pan_card.png","PAN")])   # no Udyam — intentional
    seed_bidder(tb.id, "Deepa Infrastructure Ltd",      "flagged_bidder_2_deepa",
                [("gst_certificate.png","GST"),("pan_card.png","PAN"),("udyam_certificate.png","Udyam")])
    seed_bidder(tc.id, "Manoj Tech Services",           "flagged_bidder_3_manoj",
                [("gst_certificate.png","GST"),("pan_card.png","PAN"),("udyam_certificate.png","Udyam")])

    print("\n===== SEED COMPLETE =====")
    print("  Credentials:  officer1/password123  |  admin1/admin123")
    print("  Start server: uvicorn backend.main:app --reload --port 8000\n")
    db.close()