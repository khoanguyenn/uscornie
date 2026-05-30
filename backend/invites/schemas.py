from pydantic import BaseModel


class InviteResponse(BaseModel):
    invite_token: str
    url: str
