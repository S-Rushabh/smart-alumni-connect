from typing import Optional
from pydantic import BaseModel

# Shared properties
class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    graduation_year: Optional[int] = None
    department: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    profile_picture_url: Optional[str] = None
    linkedin_url: Optional[str] = None

# Properties to receive via API on creation
class ProfileCreate(ProfileBase):
    pass

# Properties to receive via API on update
class ProfileUpdate(ProfileBase):
    pass

# Properties to return via API
class Profile(ProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
