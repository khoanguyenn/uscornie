from sqlalchemy.orm import Session

from invites.exceptions import InvalidInviteTokenError
from invites.repository import InvitationRepository
from models import Space, User
from spaces.exceptions import (
    AlreadyJoinedSpaceError,
    NotSpaceMemberError,
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
        memberships = self.space_member_repo.get_memberships(db, current_user.id)
        space_ids = [m.space_id for m in memberships]
        return self.space_repo.get_by_ids(db, space_ids)

    def join_space(self, db: Session, current_user: User, invite_token: str) -> str:  # noqa: C901
        inv = self.invite_repo.get_active_by_token(db, invite_token)
        if not inv:
            # Check double-click prevention / session recovery: B might already be a member of this accepted invite's space
            past_inv = self.invite_repo.get_by_token(db, invite_token)
            if past_inv and past_inv.status == "accepted":
                existing_member = self.space_member_repo.get_member(
                    db, past_inv.space_id, current_user.id
                )
                if existing_member:
                    return past_inv.space_id
            raise InvalidInviteTokenError()

        # Check 1: Already a member of THIS space?
        existing_member = self.space_member_repo.get_member(
            db, inv.space_id, current_user.id
        )
        if existing_member:
            return inv.space_id

        # Check 2: Guest B is not already in any shared space
        if self.space_member_repo.is_in_shared_space(db, current_user.id):
            raise AlreadyJoinedSpaceError()

        # Check 2: Inviter A is not already in any OTHER active shared space
        if self.space_member_repo.is_in_other_shared_space(
            db, inv.inviter_id, inv.space_id
        ):
            raise AlreadyJoinedSpaceError()

        # Check 3: Limit to 2 members total in a space
        member_count = self.space_member_repo.count_members(db, inv.space_id)
        if member_count >= 2:
            raise SpaceFullError()

        self.space_member_repo.create(
            db, space_id=inv.space_id, user_id=current_user.id, role="member"
        )

        # Merge Items from personal spaces to shared space
        from models import Item

        personal_host = self.space_member_repo.get_personal_space_member(
            db, inv.inviter_id
        )
        personal_guest = self.space_member_repo.get_personal_space_member(
            db, current_user.id
        )

        if personal_host:
            db.query(Item).filter(Item.space_id == personal_host.space_id).update(
                {"space_id": inv.space_id}, synchronize_session="fetch"
            )
        if personal_guest:
            db.query(Item).filter(Item.space_id == personal_guest.space_id).update(
                {"space_id": inv.space_id}, synchronize_session="fetch"
            )

        # Mark invitation as used & accepted
        inv.is_used = True
        inv.status = "accepted"
        db.commit()

        return inv.space_id

    def get_space_stats(
        self, db: Session, space_id: str, current_user: User | None = None
    ) -> dict:
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

        categories = dict(results)

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
