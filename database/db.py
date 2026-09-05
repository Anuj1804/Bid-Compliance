"""
Database connection setup.
SQLite for the hackathon prototype, per team decision — swap DATABASE_URL
for a Postgres connection string later with zero other code changes.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "sqlite:///./bid_compliance.db"

# check_same_thread=False is needed because FastAPI can use the session
# across threads; safe for SQLite in a single-process dev/hackathon setup.
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency — yields a DB session per request, closes it after."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()