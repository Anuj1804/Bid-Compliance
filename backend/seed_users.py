"""
One-time seed script — creates a demo officer and admin user.
Run with: python -m backend.seed_users
"""

from database.db import SessionLocal, engine, Base
from database.models import User
from backend.services.auth_service import hash_password

Base.metadata.create_all(bind=engine)

db = SessionLocal()

demo_users = [
    {"username": "officer1", "password": "officer123", "role": "officer"},
    {"username": "admin1", "password": "admin123", "role": "admin"},
]

for u in demo_users:
    existing = db.query(User).filter(User.username == u["username"]).first()
    if existing:
        print(f"User '{u['username']}' already exists, skipping.")
        continue
    user = User(
        username=u["username"],
        hashed_password=hash_password(u["password"]),
        role=u["role"],
    )
    db.add(user)
    print(f"Created {u['role']} user: {u['username']} / {u['password']}")

db.commit()
db.close()