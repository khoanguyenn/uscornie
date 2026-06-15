"""Pydantic schemas validating authentication request payloads and structuring API responses."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel


class AuthGoogleRequest(BaseModel):
    """Schema validating the request payload to authenticate via Google OAuth."""

    credential: str


class TokenResponse(BaseModel):
    """Schema defining the response body containing the access token."""

    access_token: str
    token_type: str = "bearer"


class SessionResponse(BaseModel):
    """Schema representing an active session's details returned to the user."""

    id: str
    device_info: dict[str, Any]
    ip_address: str | None
    last_active_at: datetime
    is_current: bool
