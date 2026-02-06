from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app import models, schemas
from app.api import deps
from app.db.session import get_db, SessionLocal
from app.models.chat import Message
from app.core import security
from jose import jwt, JWTError
from app.core.config import settings

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # Map user_id to list of active websockets (allows multiple devices)
        self.active_connections: dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: str, user_id: int):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_text(message)

manager = ConnectionManager()

@router.get("/history/{user_id}", response_model=List[schemas.chat.Message])
def get_chat_history(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get chat history between current user and another user.
    """
    messages = db.query(Message).filter(
        or_(
            (Message.sender_id == current_user.id) & (Message.recipient_id == user_id),
            (Message.sender_id == user_id) & (Message.recipient_id == current_user.id)
        )
    ).order_by(Message.timestamp).all()
    return messages

@router.post("/send", response_model=schemas.chat.Message)
async def send_message(
    message_in: schemas.chat.MessageCreate,
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Send a message via HTTP (fallback/alternative to WebSocket).
    """
    message = Message(
        sender_id=current_user.id,
        recipient_id=message_in.recipient_id,
        content=message_in.content
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    
    # Try to notify recipient if connected via WS
    await manager.send_personal_message(f"From {current_user.id}: {message.content}", message_in.recipient_id)
    
    return message

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    client_id: int,
    token: str = Query(...)
):
    """
    WebSocket endpoint for real-time chat.
    Requires token in query parameter for authentication.
    """
    # Authenticate via token
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = int(payload.get("sub"))
        if user_id != client_id:
            await websocket.close(code=1008) 
            return
    except (JWTError, ValueError):
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, user_id)
    
    # Use a new DB session for WebSocket actions
    db = SessionLocal()
    
    try:
        while True:
            data = await websocket.receive_text()
            # Expected format: "recipient_id:message_content"
            try:
                recipient_id_str, content = data.split(":", 1)
                recipient_id = int(recipient_id_str)
                
                # Save to DB
                message = Message(
                    sender_id=user_id,
                    recipient_id=recipient_id,
                    content=content
                )
                db.add(message)
                db.commit()
                db.refresh(message)
                
                # Send to recipient
                await manager.send_personal_message(f"From {user_id}: {content}", recipient_id)
                
                # Send confirmation to sender (optional, or rely on them seeing it in UI)
                # await manager.send_personal_message(f"You sent: {content}", user_id)
                
            except ValueError:
                await manager.send_personal_message("Invalid message format. Use recipient_id:content", user_id)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    finally:
        db.close()
