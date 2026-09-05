"""
Minimal officer/admin auth. Real enough to demonstrate role-gated access
for the hackathon prototype — not production-hardened (no refresh tokens,
no rate limiting, short-lived hackathon secret key). Flag this openly if
asked; don't oversell it as production security.
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from database.db import get_db
from database.models import User

# In real deployment this comes from an env var / secrets manager, not a
# hardcoded default — the fallback here exists only so the hackathon demo
# runs without extra setup.
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "sih26100-hackathon-dev-secret-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8  # 8 hours — long enough for a demo day

# pbkdf2_sha256 chosen over bcrypt: pure-Python, no native-library version
# conflicts across teammates' machines (a common bcrypt/passlib pain point) —
# still a solid, salted, iterated hash for a hackathon-grade auth system.
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(username: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": username, "role": role, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


class CurrentUser:
    def __init__(self, username: str, role: str):
        self.username = username
        self.role = role


def get_current_user(token: str = Depends(oauth2_scheme)) -> CurrentUser:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None or role is None:
            raise credentials_exception
        return CurrentUser(username=username, role=role)
    except JWTError:
        raise credentials_exception


def require_admin(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    """Route dependency — attach to any endpoint only admins may call."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required for this action",
        )
    return current_user