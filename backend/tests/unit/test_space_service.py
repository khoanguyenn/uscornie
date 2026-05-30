import pytest
from sqlalchemy.orm import Session

from models import Invitation, Space, SpaceMember, User
from spaces.exceptions import (
    AlreadyJoinedSpaceError,
    SpaceAlreadyOwnedError,
    SpaceFullError,
)
from spaces.service import SpaceService


def test_create_space_success(db: Session):
    # Setup: Create 1 user in the database
    user = User(email="test_user@example.com", full_name="Test User")
    db.add(user)
    db.commit()

    # Action: Create a shared space for the user
    service = SpaceService()
    space = service.create_space(db, user)

    # Assert: Verify the space is created successfully
    assert space.id is not None
    assert space.type == "shared"
    assert "Test User" in space.name

    # Assert: Verify the space member record is created for this user as admin
    member = db.query(SpaceMember).filter(SpaceMember.space_id == space.id).first()
    assert member is not None
    assert member.user_id == user.id
    assert member.role == "admin"


def test_create_space_already_owned_error(db: Session):
    # Setup: Create 1 user and their first shared space (with them as admin)
    user = User(email="test_user@example.com", full_name="Test User")
    db.add(user)
    db.commit()

    space = Space(name="Shared Space 1", type="shared")
    db.add(space)
    db.commit()

    member = SpaceMember(space_id=space.id, user_id=user.id, role="admin")
    db.add(member)
    db.commit()

    # Action & Assert: Attempting to create another shared space should throw SpaceAlreadyOwnedError
    service = SpaceService()
    with pytest.raises(SpaceAlreadyOwnedError):
        service.create_space(db, user)


def test_get_my_spaces(db: Session):
    # Setup: Create a user
    user = User(email="test_user@example.com", full_name="Test User")
    db.add(user)
    db.commit()

    # Create 2 spaces: one personal (admin) and one shared (member)
    space1 = Space(name="Personal Space", type="personal")
    space2 = Space(name="Shared Space", type="shared")
    db.add_all([space1, space2])
    db.commit()

    member1 = SpaceMember(space_id=space1.id, user_id=user.id, role="admin")
    member2 = SpaceMember(space_id=space2.id, user_id=user.id, role="member")
    db.add_all([member1, member2])
    db.commit()

    # Action: Get spaces for this user
    service = SpaceService()
    spaces = service.get_my_spaces(db, user)

    # Assert: Verify both spaces are retrieved
    assert len(spaces) == 2
    space_ids = {s.id for s in spaces}
    assert space1.id in space_ids
    assert space2.id in space_ids


def test_join_space_success(db: Session):
    # Setup: Create host user, guest user, shared space, and invitation
    host = User(email="host@example.com", full_name="Host User")
    guest = User(email="guest@example.com", full_name="Guest User")
    db.add_all([host, guest])
    db.commit()

    space = Space(name="Host Shared Space", type="shared")
    db.add(space)
    db.commit()

    host_member = SpaceMember(space_id=space.id, user_id=host.id, role="admin")
    db.add(host_member)
    db.commit()

    invitation = Invitation(
        token="valid-token-123", space_id=space.id, inviter_id=host.id
    )
    db.add(invitation)
    db.commit()

    # Action: Guest joins the space using the invitation token
    service = SpaceService()
    joined_space_id = service.join_space(db, guest, "valid-token-123")

    # Assert: Verify join success
    assert joined_space_id == space.id

    # Assert: Verify database contains guest as a member
    guest_member = (
        db.query(SpaceMember)
        .filter(SpaceMember.space_id == space.id, SpaceMember.user_id == guest.id)
        .first()
    )
    assert guest_member is not None
    assert guest_member.role == "member"

    # Assert: Verify invitation is marked as used
    db.refresh(invitation)
    assert invitation.is_used is True


def test_join_space_already_member(db: Session):
    # Setup: Create a user who is already a member of the space
    user = User(email="user@example.com", full_name="User")
    db.add(user)
    db.commit()

    space = Space(name="Shared Space", type="shared")
    db.add(space)
    db.commit()

    member = SpaceMember(space_id=space.id, user_id=user.id, role="member")
    db.add(member)
    db.commit()

    invitation = Invitation(
        token="valid-token-123", space_id=space.id, inviter_id=user.id
    )
    db.add(invitation)
    db.commit()

    # Action: Join space again
    service = SpaceService()
    joined_space_id = service.join_space(db, user, "valid-token-123")

    # Assert: Returns the space_id and doesn't duplicate the member row
    assert joined_space_id == space.id
    member_count = (
        db.query(SpaceMember)
        .filter(SpaceMember.space_id == space.id, SpaceMember.user_id == user.id)
        .count()
    )
    assert member_count == 1


def test_join_space_already_joined_another_member(db: Session):
    # Setup: User is already a member of Shared Space 1
    user = User(email="user@example.com", full_name="User")
    db.add(user)
    db.commit()

    space1 = Space(name="Shared Space 1", type="shared")
    space2 = Space(name="Shared Space 2", type="shared")
    db.add_all([space1, space2])
    db.commit()

    # Member role in space 1
    member1 = SpaceMember(space_id=space1.id, user_id=user.id, role="member")
    db.add(member1)
    db.commit()

    invitation = Invitation(
        token="valid-token-2", space_id=space2.id, inviter_id="some-id"
    )
    db.add(invitation)
    db.commit()

    # Action & Assert: Attempting to join space2 should fail with AlreadyJoinedSpaceError
    service = SpaceService()
    with pytest.raises(AlreadyJoinedSpaceError):
        service.join_space(db, user, "valid-token-2")


def test_join_space_full_error(db: Session):
    # Setup: Create a shared space that already has 2 members
    user1 = User(email="user1@example.com", full_name="User 1")
    user2 = User(email="user2@example.com", full_name="User 2")
    user3 = User(email="user3@example.com", full_name="User 3")
    db.add_all([user1, user2, user3])
    db.commit()

    space = Space(name="Full Shared Space", type="shared")
    db.add(space)
    db.commit()

    member1 = SpaceMember(space_id=space.id, user_id=user1.id, role="admin")
    member2 = SpaceMember(space_id=space.id, user_id=user2.id, role="member")
    db.add_all([member1, member2])
    db.commit()

    invitation = Invitation(
        token="valid-token-full", space_id=space.id, inviter_id=user1.id
    )
    db.add(invitation)
    db.commit()

    # Action & Assert: Attempting to join space with 2 members should raise SpaceFullError
    service = SpaceService()
    with pytest.raises(SpaceFullError):
        service.join_space(db, user3, "valid-token-full")
