"""Module for schemas.py."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel


class AuthGoogleRequest(BaseModel):
    """AuthGoogleRequest."""

    credential: str


class TokenResponse(BaseModel):
    """TokenResponse."""

    access_token: str
    token_type: str = "bearer"


class SessionResponse(BaseModel):
    """SessionResponse."""

    id: str
    device_info: dict[str, Any]
    ip_address: str | None
    last_active_at: datetime
    is_current: bool
