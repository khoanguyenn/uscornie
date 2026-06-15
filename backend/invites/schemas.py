"""Module for schemas.py."""

from pydantic import BaseModel


class InviteResponse(BaseModel):
    """InviteResponse."""

    invite_token: str
    url: str


class UpdateInviteStatusRequest(BaseModel):
    """UpdateInviteStatusRequest."""

    status: str  # "cancelled" or "declined"


class SpaceStatsSummary(BaseModel):
    """SpaceStatsSummary."""

    total: int
    categories: dict[str, int]


class CreatorResponse(BaseModel):
    """CreatorResponse."""

    full_name: str | None = None
    picture: str | None = None
    stats: SpaceStatsSummary | None = None


class AcceptorResponse(BaseModel):
    """AcceptorResponse."""

    full_name: str | None = None
    picture: str | None = None
    stats: SpaceStatsSummary | None = None


class InviteStatusResponse(BaseModel):
    """InviteStatusResponse."""

    status: str
    creator: CreatorResponse
    acceptor: AcceptorResponse | None = None
