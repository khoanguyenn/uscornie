import secrets

from sqlalchemy.orm import Session

from invites.exceptions import PersonalSpaceInviteError
from models import Invitation, Space, SpaceMember, User
from spaces.exceptions import NotSpaceMemberError


def create_invite(db: Session, current_user: User, space_id: str) -> str:
    # Check if user is admin/member of this space
    member = (
        db.query(SpaceMember)
        .filter(
            SpaceMember.space_id == space_id, SpaceMember.user_id == current_user.id
        )
        .first()
    )

    if not member:
        raise NotSpaceMemberError()

    # ONLY allow inviting to SHARED spaces
    space = db.query(Space).filter(Space.id == space_id).first()
    if space and space.type != "shared":
        raise PersonalSpaceInviteError()

    token = secrets.token_urlsafe(16)
    invitation = Invitation(token=token, space_id=space_id, inviter_id=current_user.id)
    db.add(invitation)
    db.commit()

    return token
