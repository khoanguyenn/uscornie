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
    service = InviteService()
    if request.status == "cancelled":
        service.cancel_invite(db, current_user, token)
    elif request.status == "declined":
        service.decline_invite(db, current_user, token)
    return {"status": request.status}


@router.get("/invites/{token}/status", response_model=InviteStatusResponse)
async def get_invite_status(  # noqa: C901
    token: str,
    db: Annotated[Session, Depends(get_db)],
):
    from spaces.service import SpaceService

    inv_repo = InvitationRepository()
    inv = inv_repo.get_by_token(db, token)
    if not inv:
        raise InvalidInviteTokenError()

    space_service = SpaceService()

    creator = db.query(User).filter(User.id == inv.inviter_id).first()
    creator_stats = None
    if creator:
        personal_member = space_service.space_member_repo.get_personal_space_member(
            db, creator.id
        )
        if personal_member:
            creator_stats = space_service.get_space_stats(db, personal_member.space_id)

    creator_data = {
        "full_name": creator.full_name if creator else None,
        "picture": creator.picture if creator else None,
        "stats": creator_stats,
    }

    # Find acceptor if accepted
    acceptor_data = None
    acceptor_member = (
        db.query(SpaceMember)
        .filter(SpaceMember.space_id == inv.space_id, SpaceMember.role == "member")
        .first()
    )
    if acceptor_member:
        acceptor = db.query(User).filter(User.id == acceptor_member.user_id).first()
        if acceptor:
            personal_member_b = (
                space_service.space_member_repo.get_personal_space_member(
                    db, acceptor.id
                )
            )
            acceptor_stats = None
            if personal_member_b:
                acceptor_stats = space_service.get_space_stats(
                    db, personal_member_b.space_id
                )
            acceptor_data = {
                "full_name": acceptor.full_name,
                "picture": acceptor.picture,
                "stats": acceptor_stats,
            }

    return {
        "status": inv.status,
        "creator": creator_data,
        "acceptor": acceptor_data,
    }
