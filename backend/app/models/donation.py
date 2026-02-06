from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class DonationCampaign(Base):
    __tablename__ = "donation_campaigns"

    id = Column(Integer, primary_key=True, index=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    goal_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    organizer = relationship("User", back_populates="campaigns")
    donations = relationship("Donation", back_populates="campaign")

class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    campaign_id = Column(Integer, ForeignKey("donation_campaigns.id"), nullable=False)
    
    amount = Column(Float, nullable=False)
    transaction_id = Column(String, nullable=True) # Mock transaction ID from payment gateway
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User")
    campaign = relationship("DonationCampaign", back_populates="donations")
