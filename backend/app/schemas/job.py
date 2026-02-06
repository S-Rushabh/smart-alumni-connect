from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class JobBase(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    description: str
    job_type: Optional[str] = None # full-time, part-time, internship
    apply_link: Optional[str] = None

class JobCreate(JobBase):
    pass

class JobUpdate(JobBase):
    pass

class Job(JobBase):
    id: int
    posted_by_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
