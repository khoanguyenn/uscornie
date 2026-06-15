"""API endpoints for managing space invitations."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.service import get_current_user
from invites.exceptions import InvalidInviteTokenError
from invites.repository import InvitationRepository
from invites.schemas import (
    InviteResponse,
    InviteStatusResponse,
    UpdateInviteStatusRequest,
)
from invites.service import InviteService
from kit.database import get_db
from kit.dependencies import require_space_member
from models import SpaceMember, User

router = APIRouter()


@router.post("/invites/{space_id}", response_model=InviteResponse)
async def create_invite(
    space_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    member: Annotated[SpaceMember, Depends(require_space_member)],
    db: Annotated[Session, Depends(get_db)],
):
    """Create a new invitation token for a space."""
    service = InviteService()
    token = service.create_invite(db, current_user, space_id)
    return {"invite_token": token, "url": f"/join?invite_token={token}"}


@router.patch("/invites/{token}")
async def update_invite(
    token: str,
    request: UpdateInviteStatusRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Update the status of an invitation (cancel or decline)."""
    service = InviteService()
    if request.status == "cancelled":
        service.cancel_invite(db, current_user, token)
    elif request.status == "declined":
        service.decline_invite(db, current_user, token)
    return {"status": request.status}


@router.get("/invites/{token}/status", response_model=InviteStatusResponse)
async def get_invite_status(
    token: str,
    db: Annotated[Session, Depends(get_db)],
):
    """Retrieve invitation status along with creator and acceptor stats."""
    from spaces.service import SpaceService

    inv_repo = InvitationRepository()
    inv = inv_repo.get_by_token(db, token)
    if not inv:
        raise InvalidInviteTokenError()

    space_service = SpaceService()
    creator_data = space_service.get_member_profile_with_stats(db, inv.inviter_id)
    acceptor_data = space_service.get_space_acceptor_profile_with_stats(
        db, inv.space_id
    )

    return {
        "status": inv.status,
        "creator": creator_data,
        "acceptor": acceptor_data,
    }
