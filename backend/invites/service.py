"""Module for service.py."""

import secrets

from sqlalchemy.orm import Session

from invites.exceptions import (
    InvalidInviteTokenError,
    InvitationNotPendingError,
    InvitationPermissionDeniedError,
    InviteRateLimitExceededError,
    PersonalSpaceInviteError,
)
from invites.repository import InvitationRepository
from models import User
from spaces.exceptions import AlreadyJoinedSpaceError, NotSpaceMemberError
from spaces.repository import SpaceMemberRepository, SpaceRepository


class InviteService:
    """InviteService."""

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
        """create_invite."""
        # Check if user is already in a shared space other than the target space
        if self.space_member_repo.is_in_other_shared_space(
            db, current_user.id, space_id
        ):
            raise AlreadyJoinedSpaceError()

        # Check if user is admin/member of this space
        member = self.space_member_repo.get_member(db, space_id, current_user.id)
        if not member:
            raise NotSpaceMemberError()

        # ONLY allow inviting to SHARED spaces
        space = self.space_repo.get_by_id(db, space_id)
        if space and space.type != "shared":
            raise PersonalSpaceInviteError()

        # Check rate limit (max 3 invites per hour)
        recent_count = self.invite_repo.count_recent_by_inviter(
            db, current_user.id, hours=1
        )
        if recent_count >= 3:
            raise InviteRateLimitExceededError()

        token = secrets.token_urlsafe(16)
        self.invite_repo.create(
            db, token=token, space_id=space_id, inviter_id=current_user.id
        )

        return token

    def cancel_invite(self, db: Session, current_user: User, token: str) -> None:
        """cancel_invite."""
        inv = self.invite_repo.get_by_token(db, token)
        if not inv:
            raise InvalidInviteTokenError()

        if inv.inviter_id != current_user.id:
            raise InvitationPermissionDeniedError()

        if inv.status != "pending":
            raise InvitationNotPendingError()

        inv.status = "cancelled"
        db.commit()

    def decline_invite(self, db: Session, current_user: User, token: str) -> None:
        """decline_invite."""
        # Check B (current_user) eligibility
        if self.space_member_repo.is_in_shared_space(db, current_user.id):
            raise AlreadyJoinedSpaceError()

        inv = self.invite_repo.get_active_by_token(db, token)
        if not inv:
            raise InvalidInviteTokenError()

        inv.status = "declined"
        db.commit()
