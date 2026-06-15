"""Pydantic schemas validating invitation requests and structuring invitation responses."""

from pydantic import BaseModel


class InviteResponse(BaseModel):
    """Schema structuring the response containing the generated invitation token and URL."""

    invite_token: str
    url: str


class UpdateInviteStatusRequest(BaseModel):
    """Schema validating the request payload to update an invitation's status."""

    status: str  # "cancelled" or "declined"


class SpaceStatsSummary(BaseModel):
    """Schema representing statistical counts of items grouped by category within a space."""

    total: int
    categories: dict[str, int]


class CreatorResponse(BaseModel):
    """Schema defining profile and statistics of the user who created the invitation."""

    full_name: str | None = None
    picture: str | None = None
    stats: SpaceStatsSummary | None = None


class AcceptorResponse(BaseModel):
    """Schema defining profile and statistics of the user who accepted the invitation."""

    full_name: str | None = None
    picture: str | None = None
    stats: SpaceStatsSummary | None = None


class InviteStatusResponse(BaseModel):
    """Schema defining invitation status details, including inviter and acceptor metadata."""

    status: str
    creator: CreatorResponse
    acceptor: AcceptorResponse | None = None
