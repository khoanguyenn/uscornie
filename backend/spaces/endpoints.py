"""Module for endpoints.py."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.service import get_current_user
from kit.database import get_db
from models import User
from spaces.schemas import (
    JoinSpaceRequest,
    JoinSpaceResponse,
    SpaceResponse,
    SpaceStatsResponse,
)
from spaces.service import SpaceService

router = APIRouter()


@router.post("/spaces", response_model=SpaceResponse)
async def create_space(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """create_space."""
    service = SpaceService()
    space = service.create_space(db, current_user)
    return space


@router.get("/spaces/me", response_model=list[SpaceResponse])
async def get_my_spaces(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """get_my_spaces."""
    service = SpaceService()
    return service.get_my_spaces(db, current_user)


@router.post("/spaces/join", response_model=JoinSpaceResponse)
async def join_space(
    request: JoinSpaceRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """join_space."""
    service = SpaceService()
    space_id = service.join_space(db, current_user, request.invite_token)
    return {"space_id": space_id}


@router.get("/spaces/{space_id}/stats", response_model=SpaceStatsResponse)
async def get_space_stats(
    space_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """get_space_stats."""
    service = SpaceService()
    return service.get_space_stats(db, space_id, current_user=current_user)
