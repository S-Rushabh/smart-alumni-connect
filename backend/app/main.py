from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import auth, profiles, networking, jobs, events, donations, gamification, chat
from app.db.session import engine, Base
from app.models.user import User
from app.models.profile import Profile
from app.models.connection import Connection
from app.models.job import Job
from app.models.event import Event
from app.models.donation import DonationCampaign, Donation
from app.models.gamification import Badge, UserBadge
from app.models.chat import Message # Ensure model is loaded

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Alumni Connect API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(profiles.router, prefix="/api/v1/profiles", tags=["profiles"])
app.include_router(networking.router, prefix="/api/v1/networking", tags=["networking"])
app.include_router(jobs.router, prefix="/api/v1/jobs", tags=["jobs"])
app.include_router(events.router, prefix="/api/v1/events", tags=["events"])
app.include_router(donations.router, prefix="/api/v1/donations", tags=["donations"])
app.include_router(gamification.router, prefix="/api/v1/gamification", tags=["gamification"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Smart Alumni Connect API"}
