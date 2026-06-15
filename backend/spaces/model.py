"""Database models representing spaces and memberships."""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from kit.database import Base, generate_uuid, utcnow

if TYPE_CHECKING:
    from invites.model import Invitation


class Space(Base):
    """Model representing a workspace (either personal or shared) containing items and members."""

    __tablename__ = "spaces"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String, default="Our Space")
    type: Mapped[str] = mapped_column(
        String, default="personal"
    )  # "personal" or "shared"
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    members: Mapped[list["SpaceMember"]] = relationship(
        "SpaceMember", back_populates="space"
    )
    invitations: Mapped[list["Invitation"]] = relationship(
        "Invitation", back_populates="space"
    )


class SpaceMember(Base):
    """Model representing a user's membership and role within a specific space."""

    __tablename__ = "space_members"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    space_id: Mapped[str] = mapped_column(String, ForeignKey("spaces.id"))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    role: Mapped[str] = mapped_column(String, default="member")  # admin, member
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    space: Mapped["Space"] = relationship("Space", back_populates="members")
