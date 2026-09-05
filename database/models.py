"""
SQLAlchemy models for the Bid Compliance Verification Platform.

Design notes:
- JSON columns store structured data from Person 1 (checklist), Person 2 (OCR
  extraction), and Person 3 (verification checks) as-is — we don't flatten
  their output into extra columns, since their shapes are the contract.
- `audit_log` is APPEND-ONLY. There are deliberately no update_audit_log() or
  delete_audit_log() helpers anywhere in this codebase, and no route should
  ever issue an UPDATE/DELETE against this table. Every write is a fresh
  INSERT capturing a snapshot of what happened at that moment.
- Status/role fields use plain strings (not DB-level enums) to keep SQLite
  simple for the hackathon — validated at the Pydantic/API layer instead.
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, JSON, ForeignKey, DateTime, Float
)
from sqlalchemy.orm import relationship

from database.db import Base


def utcnow():
    return datetime.now(timezone.utc)


class Tender(Base):
    __tablename__ = "tenders"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    # Person 1's checklist parser output, e.g. ["GST", "PAN", "Blacklist", "Udyam"]
    required_checks = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime, default=utcnow)

    bidders = relationship("Bidder", back_populates="tender", cascade="all, delete-orphan")


class Bidder(Base):
    __tablename__ = "bidders"

    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(Integer, ForeignKey("tenders.id"), nullable=False)
    company_name = Column(String, nullable=False)
    declared_gstin = Column(String, nullable=True)
    declared_pan = Column(String, nullable=True)
    declared_udyam = Column(String, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    tender = relationship("Tender", back_populates="bidders")
    documents = relationship("Document", back_populates="bidder", cascade="all, delete-orphan")
    verification_results = relationship("VerificationResult", back_populates="bidder", cascade="all, delete-orphan")
    flags = relationship("Flag", back_populates="bidder", cascade="all, delete-orphan")
    audit_entries = relationship("AuditLog", back_populates="bidder", cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    bidder_id = Column(Integer, ForeignKey("bidders.id"), nullable=False)
    document_type = Column(String, nullable=False)  # "GST" | "PAN" | "Udyam" | ...
    file_path = Column(String, nullable=False)
    # Person 2's OCR output, e.g. {"gstin": {"value": "...", "confidence": 0.94}, ...}
    extracted_fields = Column(JSON, nullable=True)
    extraction_confidence = Column(Float, nullable=True)
    uploaded_at = Column(DateTime, default=utcnow)

    bidder = relationship("Bidder", back_populates="documents")


class VerificationResult(Base):
    __tablename__ = "verification_results"

    id = Column(Integer, primary_key=True, index=True)
    bidder_id = Column(Integer, ForeignKey("bidders.id"), nullable=False)
    compliance_score = Column(Integer, nullable=False)
    risk_level = Column(String, nullable=False)  # "LOW" | "MEDIUM" | "HIGH"
    recommendation = Column(Text, nullable=True)
    # Person 3's full checks array:
    # [{check, status, flag, reason, source, evidence, severity}, ...]
    checks = Column(JSON, nullable=False, default=list)
    calculated_at = Column(DateTime, default=utcnow)

    bidder = relationship("Bidder", back_populates="verification_results")


class Flag(Base):
    __tablename__ = "flags"

    id = Column(Integer, primary_key=True, index=True)
    bidder_id = Column(Integer, ForeignKey("bidders.id"), nullable=False)
    check_type = Column(String, nullable=False)  # "GST" | "PAN" | "Udyam" | "Blacklist" | ...
    status = Column(String, nullable=False, default="open")  # open | resolved | escalated
    severity = Column(String, nullable=True)  # LOW | MEDIUM | HIGH
    reason = Column(Text, nullable=True)
    declared_value = Column(String, nullable=True)
    verified_value = Column(String, nullable=True)
    officer_note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(String, nullable=True)

    bidder = relationship("Bidder", back_populates="flags")


class AuditLog(Base):
    """
    APPEND-ONLY. No UPDATE/DELETE against this table, anywhere, ever.
    Every meaningful action in the system writes a new row here.
    """
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, index=True)
    bidder_id = Column(Integer, ForeignKey("bidders.id"), nullable=True)  # nullable: some events (e.g. blacklist admin actions) aren't bidder-scoped
    timestamp = Column(DateTime, default=utcnow)
    event_type = Column(String, nullable=False)
    # e.g. DOCUMENT_UPLOADED, CHECK_PERFORMED, FLAG_RAISED, SCORE_CALCULATED,
    # OFFICER_REVIEWED, OFFICER_DECISION, BLACKLIST_ENTRY_ADDED
    actor = Column(String, nullable=False)  # "SYSTEM" or an officer/admin user id
    details = Column(Text, nullable=True)
    previous_state = Column(JSON, nullable=True)
    new_state = Column(JSON, nullable=True)

    bidder = relationship("Bidder", back_populates="audit_entries")


class BlacklistSandbox(Base):
    """
    Simulated (🟠 SIMULATED) blacklist data — Person 3 checks bidders against
    this table. Owned here because of the admin CRUD endpoints below.
    """
    __tablename__ = "blacklist_sandbox"

    id = Column(Integer, primary_key=True, index=True)
    pan = Column(String, nullable=True)
    company_name = Column(String, nullable=False)
    reason = Column(Text, nullable=True)
    debarred_until = Column(DateTime, nullable=True)
    added_by = Column(String, nullable=False)
    added_on = Column(DateTime, default=utcnow)


class User(Base):
    """
    Minimal officer/admin auth — real enough to demonstrate role-gating,
    not production-grade security (per hackathon prototype scope).
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="officer")  # "officer" | "admin"
    created_at = Column(DateTime, default=utcnow)