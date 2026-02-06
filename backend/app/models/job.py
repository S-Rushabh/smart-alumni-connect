from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    posted_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    title = Column(String, index=True, nullable=False)
    company = Column(String, index=True, nullable=False)
    location = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    job_type = Column(String, nullable=True) # full-time, part-time, internship
    apply_link = Column(String, nullable=True) # URL or Email
    
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)

    # Relationships
    poster = relationship("User", back_populates="jobs")
