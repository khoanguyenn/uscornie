from sqlalchemy.orm import Session

from invites.exceptions import InvalidInviteTokenError
from invites.repository import InvitationRepository
from models import Space, User
from spaces.exceptions import (
    AlreadyJoinedSpaceError,
    SpaceAlreadyOwnedError,
    SpaceFullError,
)
from spaces.repository import SpaceMemberRepository, SpaceRepository


class SpaceService:
    def __init__(
        self,
        space_repo: SpaceRepository | None = None,
        space_member_repo: SpaceMemberRepository | None = None,
        invite_repo: InvitationRepository | None = None,
    ):
        self.space_repo = space_repo or SpaceRepository()
        self.space_member_repo = space_member_repo or SpaceMemberRepository()
        self.invite_repo = invite_repo or InvitationRepository()

    def create_space(self, db: Session, current_user: User) -> Space:
        # Limit: User can only own ONE SHARED space
        existing_shared = self.space_member_repo.get_admin_shared_space_member(
            db, str(current_user.id)
        )

        if existing_shared:
            raise SpaceAlreadyOwnedError()

        space = self.space_repo.create(
            db, name=f"Không gian chung của {current_user.full_name}", type="shared"
        )
        self.space_member_repo.create(
            db, space_id=str(space.id), user_id=str(current_user.id), role="admin"
        )

        return space

    def get_my_spaces(self, db: Session, current_user: User) -> list[Space]:
        memberships = self.space_member_repo.get_memberships(db, str(current_user.id))
        space_ids = [str(m.space_id) for m in memberships]
        return self.space_repo.get_by_ids(db, space_ids)

    def join_space(self, db: Session, current_user: User, invite_token: str) -> str:
        inv = self.invite_repo.get_active_by_token(db, invite_token)
        if not inv:
            raise InvalidInviteTokenError()

        # Check 1: Already a member of THIS space?
        existing_member = self.space_member_repo.get_member(
            db, str(inv.space_id), str(current_user.id)
        )

        if existing_member:
            return str(inv.space_id)

        # Check 2: Limit - user can only join ONE other space as a member
        already_joined_another = self.space_member_repo.get_any_member_role_membership(
            db, str(current_user.id)
        )

        if already_joined_another:
            raise AlreadyJoinedSpaceError()

        # Check 3: Limit to 2 members total in a space
        member_count = self.space_member_repo.count_members(db, str(inv.space_id))
        if member_count >= 2:
            raise SpaceFullError()

        self.space_member_repo.create(
            db, space_id=str(inv.space_id), user_id=str(current_user.id), role="member"
        )

        # Mark invitation as used
        inv.is_used = True
        db.commit()

        return str(inv.space_id)
