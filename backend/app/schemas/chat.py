from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class MessageBase(BaseModel):
    recipient_id: int
    content: str

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    sender_id: int
    timestamp: datetime
    is_read: bool

    class Config:
        from_attributes = True
