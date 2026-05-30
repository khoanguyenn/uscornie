from pydantic import BaseModel


class AuthGoogleRequest(BaseModel):
    credential: str
