from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    full_name = Column(String, index=True)
    graduation_year = Column(Integer, nullable=True)
    department = Column(String, nullable=True)
    location = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    profile_picture_url = Column(String, nullable=True)
    skills = Column(String, nullable=True) # Comma separated
    interest = Column(String, nullable=True) # Comma separated
    points = Column(Integer, default=0)
    linkedin_url = Column(String, nullable=True)

    # Relationships
    user = relationship("User", back_populates="profile")
