from sqlalchemy.orm import Session

from models import Invitation


class InvitationRepository:
    def get_active_by_token(self, db: Session, token: str) -> Invitation | None:
        return (
            db.query(Invitation)
            .filter(Invitation.token == token, Invitation.is_used.is_(False))
            .first()
        )

    def create(
        self, db: Session, token: str, space_id: str, inviter_id: str
    ) -> Invitation:
        invitation = Invitation(token=token, space_id=space_id, inviter_id=inviter_id)
        db.add(invitation)
        db.commit()
        return invitation
