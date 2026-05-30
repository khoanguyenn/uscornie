from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.service import get_current_user
from kit.database import get_db
from models import User
from spaces.schemas import JoinSpaceRequest
from spaces.service import SpaceService

router = APIRouter()


@router.post("/spaces")
async def create_space(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    service = SpaceService()
    space = service.create_space(db, current_user)
    return {"id": space.id, "name": space.name, "type": space.type}


@router.get("/spaces/me")
async def get_my_spaces(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    service = SpaceService()
    return service.get_my_spaces(db, current_user)


@router.post("/spaces/join")
async def join_space(
    request: JoinSpaceRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    service = SpaceService()
    space_id = service.join_space(db, current_user, request.invite_token)
    return {"space_id": space_id}
