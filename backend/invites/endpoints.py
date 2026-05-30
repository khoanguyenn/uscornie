from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.service import get_current_user
from invites.schemas import InviteResponse
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
