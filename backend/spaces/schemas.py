"""Module for schemas.py."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class JoinSpaceRequest(BaseModel):
    """JoinSpaceRequest."""

    invite_token: str


class SpaceResponse(BaseModel):
    """SpaceResponse."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    type: str
    created_at: datetime


class JoinSpaceResponse(BaseModel):
    """JoinSpaceResponse."""

    space_id: str


class SpaceStatsResponse(BaseModel):
    """SpaceStatsResponse."""

    total: int
    categories: dict[str, int]
