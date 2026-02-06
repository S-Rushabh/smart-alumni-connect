from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps
from app.db.session import get_db
from app.models.donation import DonationCampaign, Donation
from app.core import moderation
import uuid

router = APIRouter()

@router.post("/campaigns", response_model=schemas.donation.Campaign)
def create_campaign(
    *,
    db: Session = Depends(get_db),
    campaign_in: schemas.donation.CampaignCreate,
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create a new fundraising campaign.
    """
    # Moderate content
    moderation.validate_content(campaign_in.title)
    moderation.validate_content(campaign_in.description)

    campaign = DonationCampaign(
        created_by_id=current_user.id,
        title=campaign_in.title,
        description=campaign_in.description,
        goal_amount=campaign_in.goal_amount,
        end_date=campaign_in.end_date
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign

@router.get("/campaigns", response_model=List[schemas.donation.Campaign])
def read_campaigns(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve active campaigns.
    """
    campaigns = db.query(DonationCampaign).offset(skip).limit(limit).all()
    return campaigns

@router.post("/donate", response_model=schemas.donation.Donation)
def make_donation(
    *,
    db: Session = Depends(get_db),
    donation_in: schemas.donation.DonationCreate,
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Make a donation to a campaign.
    """
    campaign = db.query(DonationCampaign).filter(DonationCampaign.id == donation_in.campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Mock payment processing
    transaction_id = str(uuid.uuid4())
    
    donation = Donation(
        user_id=current_user.id,
        campaign_id=campaign.id,
        amount=donation_in.amount,
        transaction_id=transaction_id
    )
    
    # Update campaign total
    campaign.current_amount += donation_in.amount
    
    db.add(donation)
    db.add(campaign)
    db.commit()
    db.refresh(donation)
    return donation

@router.get("/my", response_model=List[schemas.donation.Donation])
def read_my_donations(
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    List current user's donations.
    """
    donations = db.query(Donation).filter(Donation.user_id == current_user.id).all()
    return donations
