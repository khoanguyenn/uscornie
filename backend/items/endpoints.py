"""Module for endpoints.py."""

from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from auth.service import get_current_user
from items.schemas import ItemCreate, ItemResponse, ItemUpdate
from items.service import ItemService
from kit.database import get_db
from models import User

router = APIRouter()


@router.get("/spaces/{space_id}/items", response_model=list[ItemResponse])
async def get_items(
    space_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """get_items."""
    service = ItemService()
    return service.get_items(db, space_id, current_user)


@router.post(
    "/spaces/{space_id}/items",
    response_model=ItemResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_item(
    space_id: str,
    item_data: ItemCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """create_item."""
    service = ItemService()
    return service.create_item(
        db,
        space_id=space_id,
        current_user=current_user,
        category=item_data.category,
        title=item_data.title,
        desc=item_data.desc,
        tag=item_data.tag,
    )


@router.put("/spaces/{space_id}/items/{item_id}", response_model=ItemResponse)
async def update_item(
    space_id: str,
    item_id: str,
    item_data: ItemUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """update_item."""
    service = ItemService()
    return service.update_item(
        db,
        space_id=space_id,
        item_id=item_id,
        current_user=current_user,
        title=item_data.title,
        desc=item_data.desc,
        tag=item_data.tag,
    )


@router.delete(
    "/spaces/{space_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def delete_item(
    space_id: str,
    item_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """delete_item."""
    service = ItemService()
    service.delete_item(
        db, space_id=space_id, item_id=item_id, current_user=current_user
    )
