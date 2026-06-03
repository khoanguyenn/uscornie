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
    admin = User(email="admin@example.com", full_name="Admin")
    db.add_all([user, admin])
    db.commit()

    space1 = Space(name="Shared Space 1", type="shared")
    space2 = Space(name="Shared Space 2", type="shared")
    db.add_all([space1, space2])
    db.commit()

    # User is member of space 1, Admin is admin of space 1 (making it active shared space)
    db.add(SpaceMember(space_id=space1.id, user_id=admin.id, role="admin"))
    db.add(SpaceMember(space_id=space1.id, user_id=user.id, role="member"))
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


def test_join_space_already_in_shared_space(db: Session):
    # Setup
    host = User(email="host@example.com", full_name="Host")
    guest = User(email="guest@example.com", full_name="Guest")
    other_admin = User(email="other_admin@example.com", full_name="Other Admin")
    db.add_all([host, guest, other_admin])
    db.commit()

    space_host = Space(name="Host Space", type="shared")
    space_other = Space(name="Other Space", type="shared")
    db.add_all([space_host, space_other])
    db.commit()

    db.add(SpaceMember(space_id=space_host.id, user_id=host.id, role="admin"))
    db.add(SpaceMember(space_id=space_other.id, user_id=other_admin.id, role="admin"))
    db.add(SpaceMember(space_id=space_other.id, user_id=guest.id, role="member"))
    db.commit()

    invitation = Invitation(
        token="token-guest-full", space_id=space_host.id, inviter_id=host.id
    )
    db.add(invitation)
    db.commit()

    # Guest is already in another shared space, should raise AlreadyJoinedSpaceError
    service = SpaceService()
    with pytest.raises(AlreadyJoinedSpaceError):
        service.join_space(db, guest, "token-guest-full")


def test_join_space_inviter_already_in_another_space(db: Session):
    # Setup
    host = User(email="host@example.com", full_name="Host")
    guest = User(email="guest@example.com", full_name="Guest")
    other_admin = User(email="other_admin@example.com", full_name="Other Admin")
    db.add_all([host, guest, other_admin])
    db.commit()

    space_host = Space(name="Host Space", type="shared")
    space_other = Space(name="Other Space", type="shared")
    db.add_all([space_host, space_other])
    db.commit()

    # Host originally created space_host, but then joined space_other
    db.add(SpaceMember(space_id=space_host.id, user_id=host.id, role="admin"))
    db.add(SpaceMember(space_id=space_other.id, user_id=other_admin.id, role="admin"))
    db.add(SpaceMember(space_id=space_other.id, user_id=host.id, role="member"))
    db.commit()

    invitation = Invitation(
        token="token-host-other", space_id=space_host.id, inviter_id=host.id
    )
    db.add(invitation)
    db.commit()

    # Should raise error since inviter is in another space
    service = SpaceService()
    with pytest.raises(AlreadyJoinedSpaceError):
        service.join_space(db, guest, "token-host-other")


def test_join_space_merging_items(db: Session):
    from models import Item

    # Setup
    host = User(email="host@example.com", full_name="Host")
    guest = User(email="guest@example.com", full_name="Guest")
    db.add_all([host, guest])
    db.commit()

    space_shared = Space(name="Shared Space", type="shared")
    space_personal_host = Space(name="Personal Host", type="personal")
    space_personal_guest = Space(name="Personal Guest", type="personal")
    db.add_all([space_shared, space_personal_host, space_personal_guest])
    db.commit()

    db.add(SpaceMember(space_id=space_shared.id, user_id=host.id, role="admin"))
    db.add(SpaceMember(space_id=space_personal_host.id, user_id=host.id, role="admin"))
    db.add(
        SpaceMember(space_id=space_personal_guest.id, user_id=guest.id, role="admin")
    )
    db.commit()

    # Add items to personal spaces
    item1 = Item(
        space_id=space_personal_host.id, category="memories", title="Memory Host"
    )
    item2 = Item(
        space_id=space_personal_guest.id, category="wishlist", title="Wishlist Guest"
    )
    db.add_all([item1, item2])
    db.commit()

    invitation = Invitation(
        token="merge-token", space_id=space_shared.id, inviter_id=host.id
    )
    db.add(invitation)
    db.commit()

    # Join and Merge
    service = SpaceService()
    service.join_space(db, guest, "merge-token")

    # Assert items are merged to shared space
    db.refresh(item1)
    db.refresh(item2)
    assert item1.space_id == space_shared.id
    assert item2.space_id == space_shared.id


def test_space_stats(db: Session):
    from models import Item

    # Setup
    space = Space(name="Shared Space", type="shared")
    db.add(space)
    db.commit()

    item1 = Item(space_id=space.id, category="memories", title="Memory 1")
    item2 = Item(space_id=space.id, category="memories", title="Memory 2")
    item3 = Item(space_id=space.id, category="wishlist", title="Wishlist 1")
    db.add_all([item1, item2, item3])
    db.commit()

    service = SpaceService()
    stats = service.get_space_stats(db, space.id)

    # Assert dynamic counts and total
    assert stats["total"] == 3
    assert stats["categories"]["memories"] == 2
    assert stats["categories"]["wishlist"] == 1
    # Check default category value is 0
    assert stats["categories"]["cafe"] == 0


def test_join_space_simultaneous_cross_invitation(db: Session):
    # Setup: User A invites User B, and User B invites User A
    user_a = User(email="a@example.com", full_name="A")
    user_b = User(email="b@example.com", full_name="B")
    db.add_all([user_a, user_b])
    db.commit()

    space_a = Space(name="A Space", type="shared")
    space_b = Space(name="B Space", type="shared")
    db.add_all([space_a, space_b])
    db.commit()

    db.add(SpaceMember(space_id=space_a.id, user_id=user_a.id, role="admin"))
    db.add(SpaceMember(space_id=space_b.id, user_id=user_b.id, role="admin"))
    db.commit()

    inv_a = Invitation(
        token="token-a", space_id=space_a.id, inviter_id=user_a.id, status="pending"
    )
    inv_b = Invitation(
        token="token-b", space_id=space_b.id, inviter_id=user_b.id, status="pending"
    )
    db.add_all([inv_a, inv_b])
    db.commit()

    # User B accepts User A's invite (token-a) -> succeeds
    service = SpaceService()
    service.join_space(db, user_b, "token-a")

    # Now User A tries to accept User B's invite (token-b) -> must fail since User B (and A) are already in a shared space
    with pytest.raises(AlreadyJoinedSpaceError):
        service.join_space(db, user_a, "token-b")


def test_join_space_double_click_prevention(db: Session):
    # Setup
    host = User(email="host@example.com", full_name="Host")
    guest = User(email="guest@example.com", full_name="Guest")
    db.add_all([host, guest])
    db.commit()

    space = Space(name="Shared Space", type="shared")
    db.add(space)
    db.commit()

    db.add(SpaceMember(space_id=space.id, user_id=host.id, role="admin"))
    db.commit()

    invitation = Invitation(
        token="double-click-token",
        space_id=space.id,
        inviter_id=host.id,
        status="pending",
    )
    db.add(invitation)
    db.commit()

    service = SpaceService()
    # First join call succeeds
    space_id_1 = service.join_space(db, guest, "double-click-token")
    assert space_id_1 == space.id

    # Second concurrent join call should return the existing space_id without error or duplicate memberships
    space_id_2 = service.join_space(db, guest, "double-click-token")
    assert space_id_2 == space.id

    members_count = (
        db.query(SpaceMember)
        .filter(SpaceMember.space_id == space.id, SpaceMember.user_id == guest.id)
        .count()
    )
    assert members_count == 1


def test_get_space_stats_unauthorized_access(db: Session):
    # Setup
    user_a = User(email="a@example.com", full_name="A")
    user_b = User(email="b@example.com", full_name="B")
    db.add_all([user_a, user_b])
    db.commit()

    space = Space(name="A Space", type="shared")
    db.add(space)
    db.commit()

    db.add(SpaceMember(space_id=space.id, user_id=user_a.id, role="admin"))
    db.commit()

    service = SpaceService()
    # User B is not member of space, should raise NotSpaceMemberError
    from spaces.exceptions import NotSpaceMemberError

    with pytest.raises(NotSpaceMemberError):
        # We need to make sure we verify user membership on stats query. Let's pass user to verify.
        service.get_space_stats(db, space.id, current_user=user_b)


def test_accept_cancelled_or_expired_token(db: Session):
    # Setup
    host = User(email="host@example.com", full_name="Host")
    guest = User(email="guest@example.com", full_name="Guest")
    db.add_all([host, guest])
    db.commit()

    space = Space(name="Shared Space", type="shared")
    db.add(space)
    db.commit()

    db.add(SpaceMember(space_id=space.id, user_id=host.id, role="admin"))
    db.commit()

    # Cancelled token
    inv_cancelled = Invitation(
        token="token-cancelled",
        space_id=space.id,
        inviter_id=host.id,
        status="cancelled",
    )
    db.add(inv_cancelled)

    # Expired token (older than 48 hours)
    from datetime import UTC, datetime, timedelta

    old_time = datetime.now(UTC) - timedelta(hours=49)
    inv_expired = Invitation(
        token="token-expired",
        space_id=space.id,
        inviter_id=host.id,
        status="pending",
        created_at=old_time,
    )
    db.add(inv_expired)
    db.commit()

    from invites.exceptions import InvalidInviteTokenError

    service = SpaceService()

    # Cancelled token join attempt raises error
    with pytest.raises(InvalidInviteTokenError):
        service.join_space(db, guest, "token-cancelled")

    # Expired token join attempt raises error
    with pytest.raises(InvalidInviteTokenError):
        service.join_space(db, guest, "token-expired")


def test_merge_items_transactional_atomicity_on_failure(db: Session):
    from models import Item

    # Setup
    host = User(email="host@example.com", full_name="Host")
    guest = User(email="guest@example.com", full_name="Guest")
    db.add_all([host, guest])
    db.commit()

    space_shared = Space(name="Shared Space", type="shared")
    space_personal_host = Space(name="Personal Host", type="personal")
    db.add_all([space_shared, space_personal_host])
    db.commit()

    db.add(SpaceMember(space_id=space_shared.id, user_id=host.id, role="admin"))
    db.add(SpaceMember(space_id=space_personal_host.id, user_id=host.id, role="admin"))
    db.commit()

    item = Item(space_id=space_personal_host.id, category="memories", title="Host Item")
    db.add(item)
    db.commit()

    invitation = Invitation(
        token="atom-token",
        space_id=space_shared.id,
        inviter_id=host.id,
        status="pending",
    )
    db.add(invitation)
    db.commit()

    # Mock the db commit or item updates to raise an exception during join_space to simulate failure midway
    # We will raise a Mock exception during update.
    # To do this cleanly, we can make spaceRepository or member creation raise an error, or mock the session query.
    original_update = db.query

    def fail_query(*args, **kwargs):
        # Fail when querying/updating Item
        if len(args) > 0 and args[0] is Item:
            raise Exception("Mock DB Failure midway")
        return original_update(*args, **kwargs)

    db.query = fail_query

    service = SpaceService()
    with pytest.raises(Exception, match="Mock DB Failure midway"):
        service.join_space(db, guest, "atom-token")

    # Restore DB query
    db.query = original_update

    # Assert that the item was NOT merged and remains in personal space (atomicity)
    db.refresh(item)
    assert item.space_id == space_personal_host.id


def test_recreate_shared_space_after_leaving(db: Session):
    # Setup
    user = User(email="user@example.com", full_name="User")
    db.add(user)
    db.commit()

    space_old = Space(name="Old Shared Space", type="shared")
    db.add(space_old)
    db.commit()

    # User joined as member
    member = SpaceMember(space_id=space_old.id, user_id=user.id, role="member")
    db.add(member)
    db.commit()

    # User leaves/deletes membership (membership row deleted)
    db.delete(member)
    db.commit()

    # User should now be allowed to create a new shared space
    service = SpaceService()
    new_space = service.create_space(db, user)
    assert new_space.id is not None
    assert new_space.type == "shared"
