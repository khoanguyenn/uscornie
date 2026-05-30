from sqlalchemy.orm import Session

from invites.exceptions import InvalidInviteTokenError
from models import Invitation, Space, SpaceMember, User
from spaces.exceptions import (
    AlreadyJoinedSpaceError,
    SpaceAlreadyOwnedError,
    SpaceFullError,
)


def create_space(db: Session, current_user: User) -> Space:
    # Limit: User can only own ONE SHARED space
    existing_shared = (
        db.query(SpaceMember)
        .join(Space)
        .filter(
            SpaceMember.user_id == current_user.id,
            SpaceMember.role == "admin",
            Space.type == "shared",
        )
        .first()
    )

    if existing_shared:
        raise SpaceAlreadyOwnedError()

    space = Space(name=f"Không gian chung của {current_user.full_name}", type="shared")
    db.add(space)
    db.commit()
    db.refresh(space)

    member = SpaceMember(space_id=space.id, user_id=current_user.id, role="admin")
    db.add(member)
    db.commit()

    return space


def get_my_spaces(db: Session, current_user: User) -> list[Space]:
    memberships = (
        db.query(SpaceMember).filter(SpaceMember.user_id == current_user.id).all()
    )
    space_ids = [m.space_id for m in memberships]
    return db.query(Space).filter(Space.id.in_(space_ids)).all()


def join_space(db: Session, current_user: User, invite_token: str) -> str:
    inv = (
        db.query(Invitation)
        .filter(Invitation.token == invite_token, Invitation.is_used.is_(False))
        .first()
    )

    if not inv:
        raise InvalidInviteTokenError()

    # Check 1: Already a member of THIS space?
    existing_member = (
        db.query(SpaceMember)
        .filter(
            SpaceMember.space_id == inv.space_id, SpaceMember.user_id == current_user.id
        )
        .first()
    )

    if existing_member:
        return str(inv.space_id)

    # Check 2: Limit - user can only join ONE other space as a member
    already_joined_another = (
        db.query(SpaceMember)
        .filter(SpaceMember.user_id == current_user.id, SpaceMember.role == "member")
        .first()
    )

    if already_joined_another:
        raise AlreadyJoinedSpaceError()

    # Check 3: Limit to 2 members total in a space
    member_count = (
        db.query(SpaceMember).filter(SpaceMember.space_id == inv.space_id).count()
    )
    if member_count >= 2:
        raise SpaceFullError()

    new_member = SpaceMember(
        space_id=inv.space_id, user_id=current_user.id, role="member"
    )
    db.add(new_member)
    db.commit()

    return str(inv.space_id)
