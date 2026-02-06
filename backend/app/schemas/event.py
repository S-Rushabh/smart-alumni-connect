from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_type: str = "virtual"
    start_time: datetime
    end_time: Optional[datetime] = None
    location: Optional[str] = None
    max_attendees: Optional[int] = None

class EventCreate(EventBase):
    pass

class Event(EventBase):
    id: int
    organizer_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
