from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from kit.database import Base, generate_uuid, utcnow

if TYPE_CHECKING:
    from models.invitation import Invitation
    from models.space_member import SpaceMember


class Space(Base):
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
