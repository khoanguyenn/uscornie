from datetime import datetime
from typing import Any

from pydantic import BaseModel


class AuthGoogleRequest(BaseModel):
    credential: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class SessionResponse(BaseModel):
    id: str
    device_info: dict[str, Any]
    ip_address: str
    last_active_at: datetime
    is_current: bool
