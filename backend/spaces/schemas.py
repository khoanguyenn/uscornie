"""Pydantic schemas validating space requests and structuring space API responses."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class JoinSpaceRequest(BaseModel):
    """Schema validating the request payload containing the invite token to join a space."""

    invite_token: str


class SpaceResponse(BaseModel):
    """Schema structuring the response details representing a space."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    type: str
    created_at: datetime


class JoinSpaceResponse(BaseModel):
    """Schema structuring the response containing the joined space ID."""

    space_id: str


class SpaceStatsResponse(BaseModel):
    """Schema structuring space statistics details including total items and category groupings."""

    total: int
    categories: dict[str, int]
