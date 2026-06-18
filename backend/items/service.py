"""Business logic service layer managing item operations."""

from sqlalchemy.orm import Session

from items.exceptions import ItemNotFoundError
from items.repository import ItemRepository
from models import Item, User
from spaces.exceptions import NotSpaceMemberError
from spaces.repository import SpaceMemberRepository


class ItemService:
    """Service class coordinating item retrieval, creation, updates, and deletion with RBAC checks."""

    def __init__(
        self,
        item_repo: ItemRepository | None = None,
        space_member_repo: SpaceMemberRepository | None = None,
    ):
        self.item_repo = item_repo or ItemRepository()
        self.space_member_repo = space_member_repo or SpaceMemberRepository()

    def _verify_space_membership(self, db: Session, space_id: str, user_id: str):
        """Verify if a user is a member of the specified space.

        Args:
            db (Session): The database session.
            space_id (str): The unique ID of the space.
            user_id (str): The unique ID of the user.

        Raises:
            NotSpaceMemberError: If the user is not a member of the space.
        """
        member = self.space_member_repo.get_member(db, space_id, user_id)
        if not member:
            raise NotSpaceMemberError()

    def get_items(self, db: Session, space_id: str, current_user: User) -> list[Item]:
        """Retrieve all items within a space, ensuring the requestor is an authorized space member.

        Args:
            db (Session): The database session.
            space_id (str): The unique ID of the space.
            current_user (User): The user requesting the items.

        Returns:
            list[Item]: A list of saved Item records.

        Raises:
            NotSpaceMemberError: If the user is not a member of the space.
        """
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
        """Create an item within a space, validating user membership and payload inputs.

        Args:
            db (Session): The database session.
            space_id (str): The unique ID of the target space.
            current_user (User): The user creating the item.
            category (str): The category under which the item is stored.
            title (str): The title of the item.
            desc (str | None, optional): An optional description. Defaults to None.
            tag (str | None, optional): An optional classification tag. Defaults to None.

        Returns:
            Item: The newly created Item object.

        Raises:
            NotSpaceMemberError: If the user is not a member of the space.
        """
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
        """Update an existing item inside a space, checking membership and resource ownership.

        Args:
            db (Session): The database session.
            space_id (str): The unique ID of the space containing the item.
            item_id (str): The unique ID of the item.
            current_user (User): The user performing the update.
            title (str | None, optional): Updated title. Defaults to None.
            desc (str | None, optional): Updated description. Defaults to None.
            tag (str | None, optional): Updated tag. Defaults to None.

        Returns:
            Item: The updated Item object.

        Raises:
            NotSpaceMemberError: If the user is not a member of the space.
            ItemNotFoundError: If the item does not exist or belongs to another space.
        """
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
        """Delete an item from a space, validating membership and authorization limits.

        Args:
            db (Session): The database session.
            space_id (str): The unique ID of the space.
            item_id (str): The unique ID of the item.
            current_user (User): The user deleting the item.

        Raises:
            NotSpaceMemberError: If the user is not a member of the space.
            ItemNotFoundError: If the item does not exist or belongs to another space.
        """
        self._verify_space_membership(db, space_id, current_user.id)
        item = self.item_repo.get_by_id(db, item_id)
        if not item or item.space_id != space_id:
            raise ItemNotFoundError()
        self.item_repo.delete(db, item)
