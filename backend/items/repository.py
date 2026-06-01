from sqlalchemy.orm import Session

from models import Item


class ItemRepository:
    def get_by_id(self, db: Session, item_id: str) -> Item | None:
        return db.query(Item).filter(Item.id == item_id).first()

    def get_by_space(self, db: Session, space_id: str) -> list[Item]:
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
        for key, value in kwargs.items():
            if value is not None:
                setattr(item, key, value)
        db.commit()
        db.refresh(item)
        return item

    def delete(self, db: Session, item: Item) -> None:
        db.delete(item)
        db.commit()
