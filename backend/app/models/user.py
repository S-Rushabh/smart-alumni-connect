from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from ..db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(String, default="student") # student, alumni, admin
    is_active = Column(Boolean, default=True)

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    jobs = relationship("Job", back_populates="poster", cascade="all, delete-orphan")
    events_organized = relationship("Event", back_populates="organizer", cascade="all, delete-orphan")
    campaigns = relationship("DonationCampaign", back_populates="organizer", cascade="all, delete-orphan")
    badges = relationship("UserBadge", back_populates="user", cascade="all, delete-orphan")

    # We will add relationships later (e.g., jobs, posts)