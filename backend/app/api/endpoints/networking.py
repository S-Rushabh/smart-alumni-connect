from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app import models, schemas
from app.api import deps
from app.db.session import get_db
from app.models.connection import Connection, ConnectionStatus
from app.models.user import User
from app.models.profile import Profile

router = APIRouter()

@router.get("/search", response_model=List[schemas.profile.Profile])
def search_profiles(
    q: Optional[str] = None,
    department: Optional[str] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Search for alumni/students by name, department, or graduation year.
    """
    query = db.query(Profile)
    
    if q:
        query = query.filter(Profile.full_name.ilike(f"%{q}%"))
    if department:
        query = query.filter(Profile.department.ilike(f"%{department}%"))
    if year:
        query = query.filter(Profile.graduation_year == year)
        
    return query.all()

@router.post("/connect/{user_id}", response_model=schemas.networking.Connection)
def send_connection_request(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Send a connection request to another user.
    """
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot connect with yourself")
    
    # Check if connection already exists (in either direction)
    existing = db.query(Connection).filter(
        or_(
            (Connection.requester_id == current_user.id) & (Connection.recipient_id == user_id),
            (Connection.requester_id == user_id) & (Connection.recipient_id == current_user.id)
        )
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Connection request already exists or you are already connected")
    
    connection = Connection(
        requester_id=current_user.id,
        recipient_id=user_id,
        status=ConnectionStatus.PENDING
    )
    db.add(connection)
    db.commit()
    db.refresh(connection)
    return connection

@router.put("/connect/{request_id}", response_model=schemas.networking.Connection)
def respond_connection_request(
    request_id: int,
    connection_in: schemas.networking.ConnectionUpdate,
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Accept or Decline a connection request.
    Only the recipient can accept/decline.
    """
    connection = db.query(Connection).filter(Connection.id == request_id).first()
    if not connection:
        raise HTTPException(status_code=404, detail="Connection request not found")
        
    if connection.recipient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to respond to this request")
        
    if connection_in.status not in [ConnectionStatus.ACCEPTED, ConnectionStatus.DECLINED]:
         raise HTTPException(status_code=400, detail="Invalid status")

    connection.status = connection_in.status
    db.commit()
    db.refresh(connection)
    return connection

@router.get("/requests/received", response_model=List[schemas.networking.Connection])
def list_received_requests(
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    List pending connection requests received by current user.
    """
    requests = db.query(Connection).filter(
        Connection.recipient_id == current_user.id,
        Connection.status == ConnectionStatus.PENDING
    ).all()
    return requests

@router.get("/connections", response_model=List[schemas.networking.Connection])
def list_connections(
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    List all accepted connections.
    """
    connections = db.query(Connection).filter(
        or_(
            Connection.requester_id == current_user.id,
            Connection.recipient_id == current_user.id
        ),
        Connection.status == ConnectionStatus.ACCEPTED
    ).all()
    return connections
