"""Business logic service layer for authentication operations."""

import logging
import os
from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from google.auth.transport import requests
from google.oauth2 import id_token
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from auth.exceptions import (
    CredentialsError,
    GoogleAuthError,
    SessionExpiredError,
    SessionInvalidError,
    SessionReusedError,
)
from auth.repository import SessionRepository, UserRepository
from kit.database import get_db
from models import User, UserSession
from spaces.repository import SpaceMemberRepository, SpaceRepository

logger = logging.getLogger(__name__)

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key-change-me")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/google")


def _is_expired(expires_at: datetime) -> bool:
    now = datetime.now(UTC)
    if expires_at.tzinfo is None and now.tzinfo is not None:
        now = now.replace(tzinfo=None)
    elif expires_at.tzinfo is not None and now.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=None)
    return expires_at < now


class AuthService:
    """Service class managing OAuth verification, token generation, and active session validation."""

    def __init__(
        self,
        user_repo: UserRepository | None = None,
        space_repo: SpaceRepository | None = None,
        space_member_repo: SpaceMemberRepository | None = None,
        session_repo: SessionRepository | None = None,
    ):
        self.user_repo = user_repo or UserRepository()
        self.space_repo = space_repo or SpaceRepository()
        self.space_member_repo = space_member_repo or SpaceMemberRepository()
        self.session_repo = session_repo or SessionRepository()

    def create_token(self, user_id: str) -> str:
        """Create a signed JWT access token for a user with standard expiration claims.

        Args:
            user_id (str): The unique ID of the user.

        Returns:
            str: The encoded JWT access token string.
        """
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        expire = datetime.now(UTC) + expires_delta
        to_encode = {"exp": expire, "sub": str(user_id)}
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    def verify_google_token(self, token: str, clock_skew_in_seconds: int = 10):
        """Verify a Google OAuth ID token against Google API endpoints and return user profile details.

        Args:
            token (str): The Google ID token credential.
            clock_skew_in_seconds (int, optional): Tolerable system clock drift. Defaults to 10.

        Returns:
            dict | None: The decoded token payload dictionary on success, or None on failure.
        """
        try:
            return id_token.verify_oauth2_token(
                token, requests.Request(), GOOGLE_CLIENT_ID, clock_skew_in_seconds
            )
        except Exception as e:
            logger.exception("Google verification failed: %s", e)
            return None

    def authenticate_google(
        self, db: Session, credential: str, device_info: dict, ip_address: str | None
    ) -> tuple[str, UserSession]:
        """Authenticate a user using their Google ID token, creating profile and default space if new.

        Args:
            db (Session): The database session.
            credential (str): The Google ID token credential.
            device_info (dict): Extracted browser/device metadata of the client.
            ip_address (str | None): The client's IP address.

        Returns:
            tuple[str, UserSession]: A tuple of the access token string and the new UserSession object.

        Raises:
            GoogleAuthError: If the Google token verification fails.
        """
        id_info = self.verify_google_token(credential, clock_skew_in_seconds=10)
        if not id_info:
            raise GoogleAuthError()

        user = self.user_repo.get_by_email(db, id_info["email"])
        if not user:
            user = self.user_repo.create(
                db,
                email=id_info["email"],
                full_name=id_info.get("name"),
                picture=id_info.get("picture"),
            )

        # Every user has a default space (owned space - personal)
        personal_space = self.space_member_repo.get_personal_space_member(db, user.id)

        if not personal_space:
            new_space = self.space_repo.create(
                db, name=f"Không gian của {user.full_name}", type="personal"
            )
            self.space_member_repo.create(
                db, space_id=new_space.id, user_id=user.id, role="admin"
            )

        access_token = self.create_token(user.id)
        session = self.session_repo.create_session(
            db, user_id=user.id, device_info=device_info, ip_address=ip_address
        )
        return access_token, session

    def _validate_and_get_session(self, db: Session, refresh_token: str) -> UserSession:
        """Validate the refresh token against active sessions, checking for expiration and reuse.

        Args:
            db (Session): The database session.
            refresh_token (str): The session ID (refresh token).

        Returns:
            UserSession: The active UserSession record.

        Raises:
            SessionInvalidError: If the session is missing, or is inactive without rotation lineage.
            SessionReusedError: If the session was already rotated, indicating potential replay attack.
            SessionExpiredError: If the session expiration time has passed.
        """
        session = self.session_repo.get_session_by_id(db, refresh_token)

        # 1. Check if session exists in DB
        if not session:
            raise SessionInvalidError()

        # 2. Check if session is inactive
        if not session.is_active:
            # Replay attack check: If token is inactive, check if it was previously rotated
            if self.session_repo.is_session_rotated(db, refresh_token):
                # Replay attack detected! Revoke all sessions for this user!
                self.session_repo.deactivate_all_user_sessions(db, session.user_id)
                raise SessionReusedError()
            raise SessionInvalidError()

        if _is_expired(session.expires_at):
            session.is_active = False
            db.commit()
            raise SessionExpiredError()

        return session

    def _rotate_session(
        self, db: Session, session: UserSession, ip_address: str | None
    ) -> UserSession:
        """Mark the current session as rotated and generate a new linked active session.

        Args:
            db (Session): The database session.
            session (UserSession): The current active session to be rotated.
            ip_address (str | None): The new client IP address.

        Returns:
            UserSession: The newly created child UserSession.
        """
        # Mark current session as rotated (inactive)
        session.is_active = False
        db.commit()

        # Create new rotated session pointing to parent
        return self.session_repo.create_session(
            db,
            user_id=session.user_id,
            device_info=session.device_info,
            ip_address=ip_address,
            parent_id=session.id,
        )

    def refresh_token_rotation(
        self, db: Session, refresh_token: str, ip_address: str | None
    ) -> tuple[str, UserSession]:
        """Verify the refresh token and perform token rotation, returning a new access token and session.

        Args:
            db (Session): The database session.
            refresh_token (str): The session ID (refresh token).
            ip_address (str | None): The client IP address.

        Returns:
            tuple[str, UserSession]: A tuple containing the new access token and the new rotated UserSession.

        Raises:
            SessionInvalidError: If the token is invalid or inactive.
            SessionReusedError: If token reuse is detected.
            SessionExpiredError: If the session has expired.
        """
        session = self._validate_and_get_session(db, refresh_token)
        new_session = self._rotate_session(db, session, ip_address)
        access_token = self.create_token(session.user_id)
        return access_token, new_session

    def get_user_by_id(self, db: Session, user_id: str) -> User | None:
        """Retrieve a user record from the database by user ID.

        Args:
            db (Session): The database session.
            user_id (str): The unique ID of the user.

        Returns:
            User | None: The matching User object if found, otherwise None.
        """
        return self.user_repo.get_by_id(db, user_id)


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """FastAPI dependency to extract and authenticate the current user from the Authorization header."""
    credentials_exception = CredentialsError(
        message="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not isinstance(user_id, str):
            raise credentials_exception
    except JWTError as err:
        raise credentials_exception from err

    service = AuthService()
    user = service.get_user_by_id(db, user_id)
    if user is None:
        raise credentials_exception
    return user
