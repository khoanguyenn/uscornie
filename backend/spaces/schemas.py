from datetime import datetime

from pydantic import BaseModel, ConfigDict


class JoinSpaceRequest(BaseModel):
    invite_token: str


class SpaceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    type: str
    created_at: datetime


class JoinSpaceResponse(BaseModel):
    space_id: str


class SpaceStatsResponse(BaseModel):
    total: int
    categories: dict[str, int]
