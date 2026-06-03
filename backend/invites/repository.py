from datetime import UTC, datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from models import Invitation


class InvitationRepository:
    def get_active_by_token(self, db: Session, token: str) -> Invitation | None:
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
        return db.query(Invitation).filter(Invitation.token == token).first()

    def count_recent_by_inviter(
        self, db: Session, inviter_id: str, hours: int = 1
    ) -> int:
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
        invitation = Invitation(
            token=token, space_id=space_id, inviter_id=inviter_id, status="pending"
        )
        db.add(invitation)
        db.commit()
        return invitation
