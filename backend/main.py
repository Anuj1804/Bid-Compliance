from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database.db import engine, Base
from backend.routes import auth, tenders, bidders, flags, blacklist

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Bid Compliance Verification Platform - SIH26100",
    description="AI-assisted, evidence-backed GeM bid compliance verification.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory for Document Preview
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(tenders.router)
app.include_router(bidders.router)
app.include_router(flags.router)
app.include_router(blacklist.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}