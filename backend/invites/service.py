"""Business logic service layer managing invitation lifetimes."""

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
    """Service class coordinating the creation, cancellation, and response handling of invites."""

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
        """Create a new invitation token for a shared space, verifying inviter eligibility.

        Ensures that the inviter is not already in another shared space, is a member
        of the target space, that the target space is indeed a shared space, and
        enforces a rate limit of 3 invitations per hour.

        Args:
            db (Session): The database session.
            current_user (User): The user attempting to create the invite.
            space_id (str): The unique ID of the target shared space.

        Returns:
            str: The randomly generated url-safe invitation token.

        Raises:
            AlreadyJoinedSpaceError: If the inviter belongs to another shared space.
            NotSpaceMemberError: If the inviter is not a member of the target space.
            PersonalSpaceInviteError: If the target space is a personal space.
            InviteRateLimitExceededError: If the user exceeded 3 creations in the last hour.
        """
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
        """Cancel a pending invitation, ensuring only the original inviter can do so.

        Args:
            db (Session): The database session.
            current_user (User): The user attempting to cancel the invitation.
            token (str): The unique secret invite token to cancel.

        Raises:
            InvalidInviteTokenError: If the token is invalid or non-existent.
            InvitationPermissionDeniedError: If the caller is not the original inviter.
            InvitationNotPendingError: If the invitation status is not pending.
        """
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
        """Decline a pending invitation, updating its status to declined.

        Args:
            db (Session): The database session.
            current_user (User): The guest user declining the invitation.
            token (str): The unique secret invite token to decline.

        Raises:
            AlreadyJoinedSpaceError: If the guest user is already in a shared space.
            InvalidInviteTokenError: If the token is invalid, expired, or already used.
        """
        # Check B (current_user) eligibility
        if self.space_member_repo.is_in_shared_space(db, current_user.id):
            raise AlreadyJoinedSpaceError()

        inv = self.invite_repo.get_active_by_token(db, token)
        if not inv:
            raise InvalidInviteTokenError()

        inv.status = "declined"
        db.commit()
