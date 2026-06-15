"""Global FastAPI dependency injections for routing endpoints."""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.service import get_current_user
from kit.database import get_db
from models import SpaceMember, User


async def require_space_member(
    space_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> SpaceMember:
    """Dependency to check if the current user is a member of the specified space.

    Args:
        space_id (str): The unique ID of the space.
        current_user (User): The currently authenticated user.
        db (Session): The database session.

    Returns:
        SpaceMember: The membership record of the user in the space.

    Raises:
        HTTPException: 403 Forbidden if the user is not a member of the space.
    """
    member = (
        db.query(SpaceMember)
        .filter(
            SpaceMember.space_id == space_id, SpaceMember.user_id == current_user.id
        )
        .first()
    )
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập không gian này.",
        )
    return member


async def require_space_admin(
    space_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> SpaceMember:
    """Dependency to check if the current user is an admin of the specified space.

    Args:
        space_id (str): The unique ID of the space.
        current_user (User): The currently authenticated user.
        db (Session): The database session.

    Returns:
        SpaceMember: The membership record indicating an admin role.

    Raises:
        HTTPException: 403 Forbidden if the user is not a member or is not an admin.
    """
    member = (
        db.query(SpaceMember)
        .filter(
            SpaceMember.space_id == space_id, SpaceMember.user_id == current_user.id
        )
        .first()
    )
    if not member or member.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền quản trị không gian này.",
        )
    return member
