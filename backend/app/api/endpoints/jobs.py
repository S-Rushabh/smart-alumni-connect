from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps
from app.db.session import get_db
from app.models.job import Job
from app.models.user import User
from app.core import moderation

router = APIRouter()

@router.post("/", response_model=schemas.job.Job)
def create_job(
    *,
    db: Session = Depends(get_db),
    job_in: schemas.job.JobCreate,
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create a new job posting.
    """
    # Moderate content
    moderation.validate_content(job_in.title)
    moderation.validate_content(job_in.description)
    moderation.validate_content(job_in.requirements)

    job = Job(
        poster_id=current_user.id,
        title=job_in.title,
        company=job_in.company,
        location=job_in.location,
        description=job_in.description,
        job_type=job_in.job_type,
        requirements=job_in.requirements,
        apply_link=job_in.apply_link
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.get("/", response_model=List[schemas.job.Job])
def read_jobs(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    q: Optional[str] = None,
    location: Optional[str] = None,
    job_type: Optional[str] = None,
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve jobs.
    """
    query = db.query(Job)
    
    if q:
        query = query.filter(Job.title.ilike(f"%{q}%"))
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if job_type:
        query = query.filter(Job.job_type == job_type)
        
    jobs = query.offset(skip).limit(limit).all()
    return jobs

@router.get("/{id}", response_model=schemas.job.Job)
def read_job(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get job by ID.
    """
    job = db.query(Job).filter(Job.id == id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
