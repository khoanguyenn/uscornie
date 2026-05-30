from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, Request, Response
from sqlalchemy.orm import Session

from auth.schemas import AuthGoogleRequest, SessionResponse, TokenResponse
from auth.service import AuthService, get_current_user
from auth.utils import parse_user_agent
from kit.database import get_db
from models import User

router = APIRouter()

REFRESH_TOKEN_COOKIE_KEY = "refresh_token"
COOKIE_MAX_AGE_DAYS = 30
COOKIE_MAX_AGE_SECONDS = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60


@router.post("/auth/google", response_model=TokenResponse)
async def auth_google(
    request_data: AuthGoogleRequest,
    request: Request,
    response: Response,
    db: Annotated[Session, Depends(get_db)],
):
    service = AuthService()
    ua = request.headers.get("user-agent", "Unknown Device")
    device_info = parse_user_agent(ua)
    ip_address = request.client.host if request.client else "Unknown IP"

    access_token, session = service.authenticate_google(
        db, request_data.credential, device_info, ip_address
    )

    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE_KEY,
        value=session.id,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=COOKIE_MAX_AGE_SECONDS,
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/auth/refresh", response_model=TokenResponse)
async def auth_refresh(
    request: Request,
    response: Response,
    db: Annotated[Session, Depends(get_db)],
    refresh_token: Annotated[str | None, Cookie()] = None,
):
    from auth.exceptions import SessionInvalidError

    if not refresh_token:
        raise SessionInvalidError(message="Refresh token is missing")

    service = AuthService()
    ip_address = request.client.host if request.client else "Unknown IP"

    access_token, new_session = service.refresh_token_rotation(
        db, refresh_token, ip_address
    )

    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE_KEY,
        value=new_session.id,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=COOKIE_MAX_AGE_SECONDS,
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/auth/logout")
async def auth_logout(
    response: Response,
    db: Annotated[Session, Depends(get_db)],
    refresh_token: Annotated[str | None, Cookie()] = None,
):
    if refresh_token:
        service = AuthService()
        service.session_repo.deactivate_session(db, refresh_token)

    response.delete_cookie(
        key=REFRESH_TOKEN_COOKIE_KEY,
        httponly=True,
        secure=True,
        samesite="strict",
    )
    return {"detail": "Logout successful"}


@router.get("/auth/sessions", response_model=list[SessionResponse])
async def get_active_sessions(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    refresh_token: Annotated[str | None, Cookie()] = None,
):
    service = AuthService()
    sessions = service.session_repo.get_active_sessions_by_user(db, current_user.id)

    return [
        {
            "id": s.id,
            "device_info": s.device_info,
            "ip_address": s.ip_address,
            "last_active_at": s.last_active_at,
            "is_current": s.id == refresh_token,
        }
        for s in sessions
    ]


@router.delete("/auth/sessions/{session_id}")
async def revoke_session(
    session_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    from auth.exceptions import SessionInvalidError

    service = AuthService()
    session = service.session_repo.get_session_by_id(db, session_id)

    if not session or session.user_id != current_user.id:
        raise SessionInvalidError(message="Session not found or access denied")

    service.session_repo.deactivate_session(db, session_id)
    return {"detail": "Session revoked successfully"}
