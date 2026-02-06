from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class Badge(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    icon_url: Optional[str] = None

    class Config:
        from_attributes = True

class UserBadge(BaseModel):
    id: int
    user_id: int
    badge: Badge
    awarded_at: datetime
    
    class Config:
        from_attributes = True

class LeaderboardEntry(BaseModel):
    user_id: int
    full_name: str
    points: int
    
    class Config:
        from_attributes = True

class BadgeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon_url: Optional[str] = None

class PointsUpdate(BaseModel):
    points: int
