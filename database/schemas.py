"""
Pydantic schemas — what the API actually sends/receives.
Kept separate from the SQLAlchemy models (database/models.py) on purpose:
DB models are storage shape, these are the wire/contract shape Person 5/6
build their frontend against.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


# ---- Honesty framework — used everywhere a check result is returned ----
class CheckStatus(str, Enum):
    VERIFIED = "VERIFIED"      # 🟢 confirmed against a real external source
    VALIDATED = "VALIDATED"    # 🟡 checked locally, no external authority
    SIMULATED = "SIMULATED"    # 🟠 sandbox/mock, clearly labeled
    MISMATCH = "MISMATCH"      # 🔴 two sources disagree
    UNVERIFIED = "UNVERIFIED"  # ⚪ lookup couldn't run (e.g. extraction failed) — distinct from a confirmed MISMATCH


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class FlagStatus(str, Enum):
    OPEN = "open"
    RESOLVED = "resolved"
    ESCALATED = "escalated"


class UserRole(str, Enum):
    OFFICER = "officer"
    ADMIN = "admin"


# ---- Tenders ----
class TenderCreate(BaseModel):
    title: str
    description: Optional[str] = None
    required_checks: List[str] = []


class TenderOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    required_checks: List[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ---- Bidders ----
class BidderCreate(BaseModel):
    tender_id: int
    company_name: str
    declared_gstin: Optional[str] = None
    declared_pan: Optional[str] = None
    declared_udyam: Optional[str] = None


class BidderOut(BaseModel):
    id: int
    tender_id: int
    company_name: str
    declared_gstin: Optional[str]
    declared_pan: Optional[str]
    declared_udyam: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ---- Documents ----
class DocumentOut(BaseModel):
    id: int
    bidder_id: int
    document_type: str
    file_path: str
    extracted_fields: Optional[Dict[str, Any]]
    extraction_confidence: Optional[float]
    uploaded_at: datetime

    class Config:
        from_attributes = True


# ---- Verification (Person 3's orchestrator output shape) ----
class CheckResult(BaseModel):
    check: str
    status: CheckStatus
    flag: bool
    reason: Optional[str] = None
    source: Optional[str] = None
    evidence: Optional[Dict[str, Any]] = None
    severity: Optional[str] = None


class VerificationOrchestratorOutput(BaseModel):
    """Exact shape Person 3's function returns — we persist this as-is."""
    bidder_name: str
    checks: List[CheckResult]
    compliance_score: int
    risk_level: RiskLevel
    breakdown: List[Any] = []
    recommendation: str


class VerificationResultOut(BaseModel):
    id: int
    bidder_id: int
    compliance_score: int
    risk_level: RiskLevel
    recommendation: Optional[str]
    checks: List[CheckResult]
    calculated_at: datetime

    class Config:
        from_attributes = True


# ---- Flags ----
class FlagUpdate(BaseModel):
    status: FlagStatus
    officer_note: Optional[str] = None


class FlagOut(BaseModel):
    id: int
    bidder_id: int
    check_type: str
    status: FlagStatus
    severity: Optional[str]
    reason: Optional[str]
    declared_value: Optional[str]
    verified_value: Optional[str]
    officer_note: Optional[str]
    created_at: datetime
    resolved_at: Optional[datetime]
    resolved_by: Optional[str]

    class Config:
        from_attributes = True


# ---- Audit log ----
class AuditLogOut(BaseModel):
    id: int
    bidder_id: Optional[int]
    timestamp: datetime
    event_type: str
    actor: str
    details: Optional[str]
    previous_state: Optional[Dict[str, Any]]
    new_state: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True


# ---- Blacklist ----
class BlacklistCreate(BaseModel):
    pan: Optional[str] = None
    company_name: str
    reason: Optional[str] = None
    debarred_until: Optional[datetime] = None


class BlacklistOut(BaseModel):
    id: int
    pan: Optional[str]
    company_name: str
    reason: Optional[str]
    debarred_until: Optional[datetime]
    added_by: str
    added_on: datetime

    class Config:
        from_attributes = True


# ---- Bidder detail (the big combined response for GET /api/bidders/{id}) ----
class BidderDetailOut(BaseModel):
    id: int
    company_name: str
    tender_id: int
    declared_gstin: Optional[str]
    declared_pan: Optional[str]
    declared_udyam: Optional[str]
    documents: List[DocumentOut] = []
    latest_verification: Optional[VerificationResultOut] = None
    flags: List[FlagOut] = []

    class Config:
        from_attributes = True


# ---- Auth ----
class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole