from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps
from app.db.session import get_db

router = APIRouter()

@router.get("/me", response_model=schemas.profile.Profile)
def read_user_me(
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user profile.
    """
    if not current_user.profile:
        # If profile doesn't exist, Create empty one? Or return 404? 
        # Better to return empty profile or create one on the fly.
        # Let's create specific logic: if profile missing, create default.
        profile = models.profile.Profile(user_id=current_user.id, full_name=current_user.full_name)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        return profile
        
    return current_user.profile

@router.put("/me", response_model=schemas.profile.Profile)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    profile_in: schemas.profile.ProfileUpdate,
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update own profile.
    """
    profile = current_user.profile
    if not profile:
        profile = models.profile.Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    update_data = profile_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

@router.get("/{user_id}", response_model=schemas.profile.Profile)
def read_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get a specific user profile by id.
    """
    user = db.query(models.user.User).filter(models.user.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    if not user.profile:
        raise HTTPException(
            status_code=404,
            detail="User profile not set up yet.",
        )
    return user.profile
