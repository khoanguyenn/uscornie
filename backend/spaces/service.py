"""Service layer for managing spaces and space memberships."""

from sqlalchemy.orm import Session

from invites.exceptions import InvalidInviteTokenError
from invites.repository import InvitationRepository
from models import Invitation, Space, SpaceMember, User
from spaces.exceptions import (
    AlreadyJoinedSpaceError,
    NotSpaceMemberError,
    SpaceAlreadyOwnedError,
    SpaceFullError,
)
from spaces.repository import SpaceMemberRepository, SpaceRepository


class SpaceService:
    """Service class coordinating space operations, stats, invitations, and joins."""

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
        """Create a new shared space for the current user.

        A user can only administer/own ONE shared space. Creating a new shared space
        automatically maps the owner as the "admin" member.

        Args:
            db (Session): The database session.
            current_user (User): The user attempting to create the space.

        Returns:
            Space: The newly created Space object.

        Raises:
            SpaceAlreadyOwnedError: If the user already owns a shared space.
        """
        # Limit: User can only own ONE SHARED space
        existing_shared = self.space_member_repo.get_admin_shared_space_member(
            db, current_user.id
        )

        if existing_shared:
            raise SpaceAlreadyOwnedError()

        space = self.space_repo.create(
            db, name=f"Không gian chung của {current_user.full_name}", type="shared"
        )
        self.space_member_repo.create(
            db, space_id=space.id, user_id=current_user.id, role="admin"
        )

        return space

    def get_my_spaces(self, db: Session, current_user: User) -> list[Space]:
        """Retrieve all spaces that the current user belongs to.

        Args:
            db (Session): The database session.
            current_user (User): The user whose spaces are to be retrieved.

        Returns:
            list[Space]: A list of Space objects.
        """
        memberships = self.space_member_repo.get_memberships(db, current_user.id)
        space_ids = [m.space_id for m in memberships]
        return self.space_repo.get_by_ids(db, space_ids)

    def get_member_profile_with_stats(self, db: Session, user_id: str) -> dict:
        """Retrieve a user's profile information along with their personal space stats.

        Args:
            db (Session): The database session.
            user_id (str): The unique ID of the user.

        Returns:
            dict: Profile dictionary containing full_name, picture, and stats dict.
        """
        creator = db.query(User).filter(User.id == user_id).first()
        if not creator:
            return {"full_name": None, "picture": None, "stats": None}

        creator_stats = None
        personal_member = self.space_member_repo.get_personal_space_member(
            db, creator.id
        )
        if personal_member:
            creator_stats = self.get_space_stats(db, personal_member.space_id)

        return {
            "full_name": creator.full_name,
            "picture": creator.picture,
            "stats": creator_stats,
        }

    def get_space_acceptor_profile_with_stats(
        self, db: Session, space_id: str
    ) -> dict | None:
        """Retrieve the profile and stats of the guest member who accepted the space invitation.

        Args:
            db (Session): The database session.
            space_id (str): The unique ID of the space.

        Returns:
            dict | None: Profile dictionary of the guest member, or None if no member role exists.
        """
        acceptor_member = (
            db.query(SpaceMember)
            .filter(SpaceMember.space_id == space_id, SpaceMember.role == "member")
            .first()
        )
        if not acceptor_member:
            return None

        return self.get_member_profile_with_stats(db, acceptor_member.user_id)

    def _check_join_eligibility(
        self, db: Session, inv: Invitation, current_user: User
    ) -> None:
        """Check if the user is eligible to join the shared space.

        Ensures that neither the guest nor host are in other active shared spaces,
        and that the target space is not already full (limit of 2 members).

        Args:
            db (Session): The database session.
            inv (Invitation): The invitation instance.
            current_user (User): The user trying to join.

        Raises:
            AlreadyJoinedSpaceError: If either user is already in another shared space.
            SpaceFullError: If the space already has 2 or more members.
        """
        if self.space_member_repo.is_in_shared_space(db, current_user.id):
            raise AlreadyJoinedSpaceError()

        if self.space_member_repo.is_in_other_shared_space(
            db, inv.inviter_id, inv.space_id
        ):
            raise AlreadyJoinedSpaceError()

        member_count = self.space_member_repo.count_members(db, inv.space_id)
        if member_count >= 2:
            raise SpaceFullError()

    def _merge_personal_items(
        self, db: Session, inviter_id: str, guest_id: str, shared_space_id: str
    ) -> None:
        """Merge items from personal spaces of inviter and guest into the shared space.

        Args:
            db (Session): The database session.
            inviter_id (str): The ID of the inviter.
            guest_id (str): The ID of the guest.
            shared_space_id (str): The ID of the destination shared space.
        """
        from models import Item

        personal_host = self.space_member_repo.get_personal_space_member(db, inviter_id)
        personal_guest = self.space_member_repo.get_personal_space_member(db, guest_id)

        if personal_host:
            db.query(Item).filter(Item.space_id == personal_host.space_id).update(
                {"space_id": shared_space_id}, synchronize_session="fetch"
            )
        if personal_guest:
            db.query(Item).filter(Item.space_id == personal_guest.space_id).update(
                {"space_id": shared_space_id}, synchronize_session="fetch"
            )

    def join_space(self, db: Session, current_user: User, invite_token: str) -> str:
        """Process joining a shared space using an invitation token.

        Validates eligibility, registers the user as a member role in the space,
        merges their personal items into the shared space, and marks the invite as accepted.

        Args:
            db (Session): The database session.
            current_user (User): The user joining the space.
            invite_token (str): The invitation token.

        Returns:
            str: The space ID of the joined space.

        Raises:
            InvalidInviteTokenError: If the invite token is invalid or already used.
            AlreadyJoinedSpaceError: If either user is already in another shared space.
            SpaceFullError: If the space is already full.
        """
        inv = self.invite_repo.get_active_by_token(db, invite_token)
        if not inv:
            past_inv = self.invite_repo.get_by_token(db, invite_token)
            if past_inv and past_inv.status == "accepted":
                existing_member = self.space_member_repo.get_member(
                    db, past_inv.space_id, current_user.id
                )
                if existing_member:
                    return past_inv.space_id
            raise InvalidInviteTokenError()

        existing_member = self.space_member_repo.get_member(
            db, inv.space_id, current_user.id
        )
        if existing_member:
            return inv.space_id

        self._check_join_eligibility(db, inv, current_user)

        self.space_member_repo.create(
            db, space_id=inv.space_id, user_id=current_user.id, role="member"
        )

        self._merge_personal_items(db, inv.inviter_id, current_user.id, inv.space_id)

        inv.is_used = True
        inv.status = "accepted"
        db.commit()

        return inv.space_id

    def get_space_stats(
        self, db: Session, space_id: str, current_user: User | None = None
    ) -> dict:
        """Retrieve item counts grouped by category for a given space.

        If a current_user is provided, space membership is verified first.

        Args:
            db (Session): The database session.
            space_id (str): The unique ID of the space.
            current_user (User | None, optional): The user requesting stats. Defaults to None.

        Returns:
            dict: A dictionary containing the total items count and category breakups.

        Raises:
            NotSpaceMemberError: If the user is not a member of the space.
        """
        if current_user:
            member = self.space_member_repo.get_member(db, space_id, current_user.id)
            if not member:
                raise NotSpaceMemberError()

        from sqlalchemy import func

        from models import Item

        # Query counts grouped dynamically by category
        results = (
            db.query(Item.category, func.count(Item.id))
            .filter(Item.space_id == space_id)
            .group_by(Item.category)
            .all()
        )

        categories = dict(results)  # type: ignore

        # Default standard categories to 0 if not present
        known_categories = ["memories", "wishlist", "cafe", "restaurant"]
        for cat in known_categories:
            if cat not in categories:
                categories[cat] = 0

        total = sum(categories.values())

        return {
            "total": total,
            "categories": categories,
        }
