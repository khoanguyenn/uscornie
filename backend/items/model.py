"""Database models representing saved items."""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from kit.database import Base, generate_uuid, utcnow


class Item(Base):
    """Model representing a saved bookmark or entry (memories, wishlist, cafe, restaurant, etc.) inside a space."""

    __tablename__ = "items"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    space_id: Mapped[str] = mapped_column(String, ForeignKey("spaces.id"))
    category: Mapped[str] = mapped_column(String)
    title: Mapped[str] = mapped_column(String)
    desc: Mapped[str | None] = mapped_column(String, nullable=True)
    tag: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
