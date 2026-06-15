"""Data access layer managing database operations for invitations."""

from datetime import UTC, datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from models import Invitation


class InvitationRepository:
    """Repository class coordinating database operations for invitations."""

    def get_active_by_token(self, db: Session, token: str) -> Invitation | None:
        """Retrieve an active (pending, non-expired, unused) invitation by its token.

        An invitation is active if it is pending, has not been used, and was created
        within the last 48 hours.

        Args:
            db (Session): The database session.
            token (str): The unique secret invite token.

        Returns:
            Invitation | None: The matching active Invitation, or None.
        """
        min_created_at = datetime.now(UTC) - timedelta(hours=48)
        return (
            db.query(Invitation)
            .filter(
                Invitation.token == token,
                Invitation.is_used.is_(False),
                Invitation.status == "pending",
                Invitation.created_at >= min_created_at,
            )
            .first()
        )

    def get_by_token(self, db: Session, token: str) -> Invitation | None:
        """Retrieve any invitation record by its token, regardless of its current status.

        Args:
            db (Session): The database session.
            token (str): The unique secret invite token.

        Returns:
            Invitation | None: The matching Invitation, or None.
        """
        return db.query(Invitation).filter(Invitation.token == token).first()

    def count_recent_by_inviter(
        self, db: Session, inviter_id: str, hours: int = 1
    ) -> int:
        """Count the number of invitations created by a user within a rolling hourly window.

        Used for rate-limiting invitation creation.

        Args:
            db (Session): The database session.
            inviter_id (str): The ID of the inviting user.
            hours (int, optional): The duration of the rolling window in hours. Defaults to 1.

        Returns:
            int: The total count of invitations created within the specified timeframe.
        """
        since = datetime.now(UTC) - timedelta(hours=hours)
        return (
            db.query(func.count(Invitation.id))
            .filter(
                Invitation.inviter_id == inviter_id,
                Invitation.created_at >= since,
            )
            .scalar()
            or 0
        )

    def create(
        self, db: Session, token: str, space_id: str, inviter_id: str
    ) -> Invitation:
        """Create, persist, and return a new pending invitation.

        Args:
            db (Session): The database session.
            token (str): The unique secret invite token.
            space_id (str): The unique ID of the target shared space.
            inviter_id (str): The user ID of the inviter.

        Returns:
            Invitation: The newly created Invitation object.
        """
        invitation = Invitation(
            token=token, space_id=space_id, inviter_id=inviter_id, status="pending"
        )
        db.add(invitation)
        db.commit()
        return invitation
