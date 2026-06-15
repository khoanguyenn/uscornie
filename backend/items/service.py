"""Module for service.py."""

from sqlalchemy.orm import Session

from items.exceptions import ItemNotFoundError
from items.repository import ItemRepository
from models import Item, User
from spaces.exceptions import NotSpaceMemberError
from spaces.repository import SpaceMemberRepository


class ItemService:
    """ItemService."""

    def __init__(
        self,
        item_repo: ItemRepository | None = None,
        space_member_repo: SpaceMemberRepository | None = None,
    ):
        self.item_repo = item_repo or ItemRepository()
        self.space_member_repo = space_member_repo or SpaceMemberRepository()

    def _verify_space_membership(self, db: Session, space_id: str, user_id: str):
        member = self.space_member_repo.get_member(db, space_id, user_id)
        if not member:
            raise NotSpaceMemberError()

    def get_items(self, db: Session, space_id: str, current_user: User) -> list[Item]:
        """get_items."""
        self._verify_space_membership(db, space_id, current_user.id)
        return self.item_repo.get_by_space(db, space_id)

    def create_item(
        self,
        db: Session,
        space_id: str,
        current_user: User,
        category: str,
        title: str,
        desc: str | None = None,
        tag: str | None = None,
    ) -> Item:
        """create_item."""
        self._verify_space_membership(db, space_id, current_user.id)
        return self.item_repo.create(
            db,
            space_id=space_id,
            category=category,
            title=title,
            desc=desc,
            tag=tag,
        )

    def update_item(
        self,
        db: Session,
        space_id: str,
        item_id: str,
        current_user: User,
        title: str | None = None,
        desc: str | None = None,
        tag: str | None = None,
    ) -> Item:
        """update_item."""
        self._verify_space_membership(db, space_id, current_user.id)
        item = self.item_repo.get_by_id(db, item_id)
        if not item or item.space_id != space_id:
            raise ItemNotFoundError()

        update_data = {}
        if title is not None:
            update_data["title"] = title
        if desc is not None:
            update_data["desc"] = desc
        if tag is not None:
            update_data["tag"] = tag

        return self.item_repo.update(db, item, **update_data)

    def delete_item(
        self, db: Session, space_id: str, item_id: str, current_user: User
    ) -> None:
        """delete_item."""
        self._verify_space_membership(db, space_id, current_user.id)
        item = self.item_repo.get_by_id(db, item_id)
        if not item or item.space_id != space_id:
            raise ItemNotFoundError()
        self.item_repo.delete(db, item)
