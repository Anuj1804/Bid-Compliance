from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.db import engine, Base
from backend.routes import auth, tenders, bidders, flags, blacklist

# Create tables on startup (fine for SQLite hackathon prototype;
# use Alembic migrations instead if this ever moves to Postgres).
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Bid Compliance Verification Platform — SIH26100",
    description="AI-assisted, evidence-backed GeM bid compliance verification. "
                "The system flags and scores — the officer decides.",
    version="0.1.0",
)

# Person 5/6's frontend will run on a different port during dev — open CORS
# for the hackathon; tighten this to specific origins before any real deploy.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tenders.router)
app.include_router(bidders.router)
app.include_router(flags.router)
app.include_router(blacklist.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}