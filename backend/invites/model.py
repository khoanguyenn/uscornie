"""Database models representing space invitations."""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from kit.database import Base, generate_uuid, utcnow

if TYPE_CHECKING:
    from spaces.model import Space


class Invitation(Base):
    """Model representing an invitation token issued by a space administrator to a guest user."""

    __tablename__ = "invitations"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    token: Mapped[str] = mapped_column(String, unique=True, index=True)
    space_id: Mapped[str] = mapped_column(String, ForeignKey("spaces.id"))
    inviter_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    is_used: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String, default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    space: Mapped["Space"] = relationship("Space", back_populates="invitations")
