from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth import service
from auth.schemas import AuthGoogleRequest
from kit.database import get_db

router = APIRouter()


@router.post("/auth/google")
async def auth_google(
    request: AuthGoogleRequest, db: Annotated[Session, Depends(get_db)]
):
    access_token = service.authenticate_google(db, request.credential)
    return {"access_token": access_token, "token_type": "bearer"}
