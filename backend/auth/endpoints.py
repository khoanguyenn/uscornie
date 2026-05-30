from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.schemas import AuthGoogleRequest, TokenResponse
from auth.service import AuthService
from kit.database import get_db

router = APIRouter()


@router.post("/auth/google", response_model=TokenResponse)
async def auth_google(
    request: AuthGoogleRequest, db: Annotated[Session, Depends(get_db)]
):
    service = AuthService()
    access_token = service.authenticate_google(db, request.credential)
    return {"access_token": access_token, "token_type": "bearer"}
