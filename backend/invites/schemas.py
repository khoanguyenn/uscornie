from pydantic import BaseModel


class InviteResponse(BaseModel):
    invite_token: str
    url: str


class UpdateInviteStatusRequest(BaseModel):
    status: str  # "cancelled" or "declined"


class SpaceStatsSummary(BaseModel):
    total: int
    categories: dict[str, int]


class CreatorResponse(BaseModel):
    full_name: str | None = None
    picture: str | None = None
    stats: SpaceStatsSummary | None = None


class AcceptorResponse(BaseModel):
    full_name: str | None = None
    picture: str | None = None
    stats: SpaceStatsSummary | None = None


class InviteStatusResponse(BaseModel):
    status: str
    creator: CreatorResponse
    acceptor: AcceptorResponse | None = None
