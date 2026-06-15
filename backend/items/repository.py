"""Data access layer managing database operations for saved items."""

from sqlalchemy.orm import Session

from models import Item


class ItemRepository:
    """Repository class coordinating CRUD actions for saved items."""

    def get_by_id(self, db: Session, item_id: str) -> Item | None:
        """Retrieve a specific item record by its unique ID.

        Args:
            db (Session): The database session.
            item_id (str): The unique ID of the item.

        Returns:
            Item | None: The matching Item object, or None if not found.
        """
        return db.query(Item).filter(Item.id == item_id).first()

    def get_by_space(self, db: Session, space_id: str) -> list[Item]:
        """Retrieve all items belonging to a specific space, ordered by creation date descending.

        Args:
            db (Session): The database session.
            space_id (str): The unique ID of the space.

        Returns:
            list[Item]: A list of Item objects in that space.
        """
        return (
            db.query(Item)
            .filter(Item.space_id == space_id)
            .order_by(Item.created_at.desc())
            .all()
        )

    def create(
        self,
        db: Session,
        space_id: str,
        category: str,
        title: str,
        desc: str | None = None,
        tag: str | None = None,
    ) -> Item:
        """Create, persist, and return a new item within a space.

        Args:
            db (Session): The database session.
            space_id (str): The unique ID of the target space.
            category (str): Category grouping (e.g. "wishlist").
            title (str): Title or name of the item.
            desc (str | None, optional): Description of the item. Defaults to None.
            tag (str | None, optional): Optional tag for the item. Defaults to None.

        Returns:
            Item: The newly created Item object.
        """
        item = Item(
            space_id=space_id,
            category=category,
            title=title,
            desc=desc,
            tag=tag,
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def update(self, db: Session, item: Item, **kwargs) -> Item:
        """Update attribute values of an existing item and persist the changes.

        Args:
            db (Session): The database session.
            item (Item): The existing Item instance to modify.
            **kwargs: Dynamic field updates (e.g. title="New Title").

        Returns:
            Item: The updated and refreshed Item object.
        """
        for key, value in kwargs.items():
            if value is not None:
                setattr(item, key, value)
        db.commit()
        db.refresh(item)
        return item

    def delete(self, db: Session, item: Item) -> None:
        """Remove a specific item from the database.

        Args:
            db (Session): The database session.
            item (Item): The Item instance to be deleted.
        """
        db.delete(item)
        db.commit()
