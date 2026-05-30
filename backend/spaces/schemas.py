from pydantic import BaseModel


class JoinSpaceRequest(BaseModel):
    invite_token: str
