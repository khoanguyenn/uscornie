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
from kit.database import get_db
from models import Space, SpaceMember, User

logger = logging.getLogger(__name__)

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key-change-me")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "43200"))
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/google")


def create_token(user_id: str) -> str:
    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.now(UTC) + expires_delta
    to_encode = {"exp": expire, "sub": str(user_id)}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_google_token(token: str, clock_skew_in_seconds: int = 10):
    try:
        return id_token.verify_oauth2_token(
            token, requests.Request(), GOOGLE_CLIENT_ID, clock_skew_in_seconds
        )
    except Exception as e:
        logger.exception("Google token verification failed: %s", e)
        return None


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

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


def authenticate_google(db: Session, credential: str) -> str:
    id_info = verify_google_token(credential, clock_skew_in_seconds=10)
    if not id_info:
        raise GoogleAuthError()

    user = db.query(User).filter(User.email == id_info["email"]).first()
    if not user:
        user = User(
            email=id_info["email"],
            full_name=id_info.get("name"),
            picture=id_info.get("picture"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Every user has a default space (owned space - personal)
    personal_space = (
        db.query(SpaceMember)
        .join(Space)
        .filter(SpaceMember.user_id == user.id, Space.type == "personal")
        .first()
    )

    if not personal_space:
        new_space = Space(name=f"Không gian của {user.full_name}", type="personal")
        db.add(new_space)
        db.commit()
        db.refresh(new_space)

        member = SpaceMember(space_id=new_space.id, user_id=user.id, role="admin")
        db.add(member)
        db.commit()

    return create_token(str(user.id))
