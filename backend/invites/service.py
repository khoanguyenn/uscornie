import secrets

from sqlalchemy.orm import Session

from invites.exceptions import PersonalSpaceInviteError
from invites.repository import InvitationRepository
from models import User
from spaces.exceptions import NotSpaceMemberError
from spaces.repository import SpaceMemberRepository, SpaceRepository


class InviteService:
    def __init__(
        self,
        invite_repo: InvitationRepository | None = None,
        space_repo: SpaceRepository | None = None,
        space_member_repo: SpaceMemberRepository | None = None,
    ):
        self.invite_repo = invite_repo or InvitationRepository()
        self.space_repo = space_repo or SpaceRepository()
        self.space_member_repo = space_member_repo or SpaceMemberRepository()

    def create_invite(self, db: Session, current_user: User, space_id: str) -> str:
        # Check if user is admin/member of this space
        member = self.space_member_repo.get_member(db, space_id, current_user.id)
        if not member:
            raise NotSpaceMemberError()

        # ONLY allow inviting to SHARED spaces
        space = self.space_repo.get_by_id(db, space_id)
        if space and space.type != "shared":
            raise PersonalSpaceInviteError()

        token = secrets.token_urlsafe(16)
        self.invite_repo.create(
            db, token=token, space_id=space_id, inviter_id=current_user.id
        )

        return token
