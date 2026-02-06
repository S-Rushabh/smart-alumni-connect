from typing import Optional
from pydantic import BaseModel
from datetime import datetime

# Campaign Schemas
class CampaignBase(BaseModel):
    title: str
    description: Optional[str] = None
    goal_amount: float
    end_date: Optional[datetime] = None

class CampaignCreate(CampaignBase):
    pass

class Campaign(CampaignBase):
    id: int
    created_by_id: int
    current_amount: float
    created_at: datetime
    
    class Config:
        from_attributes = True

# Donation Schemas
class DonationCreate(BaseModel):
    campaign_id: int
    amount: float

class Donation(BaseModel):
    id: int
    user_id: int
    campaign_id: int
    amount: float
    transaction_id: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
