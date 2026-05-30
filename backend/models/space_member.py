from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from kit.database import Base, generate_uuid, utcnow

if TYPE_CHECKING:
    from models.space import Space


class SpaceMember(Base):
    __tablename__ = "space_members"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    space_id: Mapped[str] = mapped_column(String, ForeignKey("spaces.id"))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    role: Mapped[str] = mapped_column(String, default="member")  # admin, member
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    space: Mapped["Space"] = relationship("Space", back_populates="members")
