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

from auth.exceptions import CredentialsError, GoogleAuthError
from auth.repository import UserRepository
from kit.database import get_db
from models import User
from spaces.repository import SpaceMemberRepository, SpaceRepository

logger = logging.getLogger(__name__)

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key-change-me")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "43200"))
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/google")


class AuthService:
    def __init__(
        self,
        user_repo: UserRepository | None = None,
        space_repo: SpaceRepository | None = None,
        space_member_repo: SpaceMemberRepository | None = None,
    ):
        self.user_repo = user_repo or UserRepository()
        self.space_repo = space_repo or SpaceRepository()
        self.space_member_repo = space_member_repo or SpaceMemberRepository()

    def create_token(self, user_id: str) -> str:
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        expire = datetime.now(UTC) + expires_delta
        to_encode = {"exp": expire, "sub": str(user_id)}
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    def verify_google_token(self, token: str, clock_skew_in_seconds: int = 10):
        try:
            return id_token.verify_oauth2_token(
                token, requests.Request(), GOOGLE_CLIENT_ID, clock_skew_in_seconds
            )
        except Exception as e:
            logger.exception("Google token verification failed: %s", e)
            return None

    def authenticate_google(self, db: Session, credential: str) -> str:
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

        return self.create_token(user.id)

    def get_user_by_id(self, db: Session, user_id: str) -> User | None:
        return self.user_repo.get_by_id(db, user_id)


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
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
