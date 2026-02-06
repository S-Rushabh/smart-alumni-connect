from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from app.schemas.user import User

class ConnectionBase(BaseModel):
    pass

class ConnectionCreate(ConnectionBase):
    recipient_id: int

class ConnectionUpdate(ConnectionBase):
    status: str # "accepted" or "declined"

class Connection(ConnectionBase):
    id: int
    requester_id: int
    recipient_id: int
    status: str
    created_at: datetime
    
    # Include details if needed, for listing
    requester: Optional[User] = None
    recipient: Optional[User] = None

    class Config:
        from_attributes = True
