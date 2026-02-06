from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import dest
from app import models, schemas
from app.api import deps
from app.db.session import get_db
from app.models.gamification import Badge, UserBadge
from app.models.profile import Profile
from app.models.user import User

router = APIRouter()

@router.get("/leaderboard", response_model=List[schemas.gamification.LeaderboardEntry])
def get_leaderboard(
    db: Session = Depends(get_db),
    limit: int = 10,
) -> Any:
    """
    Get top users by points.
    """
    # Join Profile and User to get names
    results = db.query(Profile).join(User).order_by(Profile.points.desc()).limit(limit).all()
    
    leaderboard = []
    for profile in results:
        leaderboard.append({
            "user_id": profile.user_id,
            "full_name": profile.full_name,
            "points": profile.points
        })
    return leaderboard

@router.get("/badges", response_model=List[schemas.gamification.Badge])
def get_badges(
    db: Session = Depends(get_db),
) -> Any:
    """
    List all available badges.
    """
    badges = db.query(Badge).all()
    return badges

@router.get("/my-badges", response_model=List[schemas.gamification.UserBadge])
def get_my_badges(
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get badges earned by current user.
    """
    user_badges = db.query(UserBadge).filter(UserBadge.user_id == current_user.id).all()
    return user_badges

@router.post("/badges", response_model=schemas.gamification.Badge)
def create_badge(
    badge_in: schemas.gamification.BadgeCreate,
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(deps.get_current_user), # Should be admin
) -> Any:
    """
    Create a new badge.
    """
    badge = Badge(
        name=badge_in.name,
        description=badge_in.description,
        icon_url=badge_in.icon_url
    )
    db.add(badge)
    db.commit()
    db.refresh(badge)
    return badge

@router.post("/award-points", response_model=schemas.gamification.LeaderboardEntry)
def award_points(
    points_in: schemas.gamification.PointsUpdate,
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Award points to yourself (Demo/Test purpose).
    In real app, this would be triggered by events.
    """
    profile = current_user.profile
    if not profile:
         profile = models.profile.Profile(user_id=current_user.id)
         db.add(profile)
    
    profile.points += points_in.points
    db.add(profile)
    db.commit()
    db.refresh(profile)
    
    return {
        "user_id": current_user.id,
        "full_name": profile.full_name or "Unknown",
        "points": profile.points
    }
