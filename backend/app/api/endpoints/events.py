from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps
from app.db.session import get_db
from app.models.event import Event
from app.core import moderation

router = APIRouter()

@router.post("/", response_model=schemas.event.Event)
def create_event(
    *,
    db: Session = Depends(get_db),
    event_in: schemas.event.EventCreate,
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create a new event.
    """
    # Moderate content
    moderation.validate_content(event_in.title)
    moderation.validate_content(event_in.description)
    moderation.validate_content(event_in.location)

    event = Event(
        organizer_id=current_user.id,
        title=event_in.title,
        description=event_in.description,
        event_type=event_in.event_type,
        start_time=event_in.start_time,
        end_time=event_in.end_time,
        location=event_in.location,
        max_attendees=event_in.max_attendees
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.get("/", response_model=List[schemas.event.Event])
def read_events(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve events.
    """
    events = db.query(Event).offset(skip).limit(limit).all()
    return events

@router.get("/{id}", response_model=schemas.event.Event)
def read_event(
    id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get event by ID.
    """
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
