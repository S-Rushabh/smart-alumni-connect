from fastapi import HTTPException

# List of banned words (Mock for MVP)
BANNED_WORDS = {
    "scam", "fraud", "illegal", "offensive", "hate", "violence"
}

def validate_content(text: str):
    """
    Validates the text content.
    Raises HTTPException if banned words are found.
    """
    if not text:
        return
    
    words = text.lower().split()
    found_banned = [word for word in words if word in BANNED_WORDS]
    
    if found_banned:
        raise HTTPException(
            status_code=400,
            detail=f"Content contains restricted words: {', '.join(found_banned)}"
        )
