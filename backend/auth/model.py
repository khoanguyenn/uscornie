"""Database models representing users and authentication sessions."""

from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from kit.database import Base, generate_uuid, utcnow


class User(Base):
    """Model representing a registered user in the application."""

    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    full_name: Mapped[str | None] = mapped_column(String, nullable=True)
    picture: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class UserSession(Base):
    """Model representing an active user login session, supporting refresh token rotation.

    To defend against replay attacks, sessions utilize family token rotation.
    If an old (rotated/inactive) session token is reused, the session lineage is traced via `parent_id`
    to identify the breach and trigger family revocation (deactivating all sessions belonging to the user).
    """

    __tablename__ = "user_sessions"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    device_info: Mapped[dict] = mapped_column(JSON)
    ip_address: Mapped[str | None] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    parent_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("user_sessions.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    last_active_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    expires_at: Mapped[datetime] = mapped_column(DateTime)
