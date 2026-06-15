import pytest
from sqlalchemy.orm import Session

from invites.exceptions import PersonalSpaceInviteError
from invites.service import InviteService
from models import Invitation, Space, SpaceMember, User
from spaces.exceptions import NotSpaceMemberError


def test_create_invite_success(db: Session):
    """
    Verify create invite success flow.
    Setup: Create user and a shared space where they are admin
    Action: Create invitation
    Assert: Verify token and invitation database record
    """
    # Setup: Create user and a shared space where they are admin
    user = User(email="admin@example.com", full_name="Admin User")
    db.add(user)
    db.commit()

    space = Space(name="Shared Space", type="shared")
    db.add(space)
    db.commit()

    member = SpaceMember(space_id=space.id, user_id=user.id, role="admin")
    db.add(member)
    db.commit()

    # Action: Create invitation
    service = InviteService()
    token = service.create_invite(db, user, space.id)

    # Assert: Verify token and invitation database record
    assert token is not None
    assert isinstance(token, str)

    inv = db.query(Invitation).filter(Invitation.token == token).first()
    assert inv is not None
    assert inv.space_id == space.id
    assert inv.inviter_id == user.id
    assert inv.is_used is False


def test_create_invite_not_member_error(db: Session):
    """
    Verify create invite not member error flow.
    Setup: Create user and a shared space, but user is NOT a member of it
    Action: Action & Assert: Attempt to invite should raise NotSpaceMemberError
    """
    # Setup: Create user and a shared space, but user is NOT a member of it
    user = User(email="stranger@example.com", full_name="Stranger")
    db.add(user)
    db.commit()

    space = Space(name="Shared Space", type="shared")
    db.add(space)
    db.commit()

    # Action & Assert: Attempt to invite should raise NotSpaceMemberError
    service = InviteService()
    with pytest.raises(NotSpaceMemberError):
        service.create_invite(db, user, space.id)


def test_create_invite_personal_space_error(db: Session):
    """
    Verify create invite personal space error flow.
    Setup: Create user and their personal space where they are admin
    Action: Action & Assert: Inviting to personal space should raise PersonalSpaceInviteError
    """
    # Setup: Create user and their personal space where they are admin
    user = User(email="owner@example.com", full_name="Owner User")
    db.add(user)
    db.commit()

    space = Space(name="Personal Space", type="personal")
    db.add(space)
    db.commit()

    member = SpaceMember(space_id=space.id, user_id=user.id, role="admin")
    db.add(member)
    db.commit()

    # Action & Assert: Inviting to personal space should raise PersonalSpaceInviteError
    service = InviteService()
    with pytest.raises(PersonalSpaceInviteError):
        service.create_invite(db, user, space.id)


def test_create_invite_rate_limit(db: Session):
    """
    Verify create invite rate limit flow.
    Setup: Setup
    """
    # Setup
    user = User(email="admin@example.com", full_name="Admin User")
    db.add(user)
    db.commit()

    space = Space(name="Shared Space", type="shared")
    db.add(space)
    db.commit()

    member = SpaceMember(space_id=space.id, user_id=user.id, role="admin")
    db.add(member)
    db.commit()

    service = InviteService()

    # Create 3 invites successfully
    for _ in range(3):
        token = service.create_invite(db, user, space.id)
        assert token is not None

    # The 4th invite should fail due to Rate Limit
    from invites.exceptions import InviteRateLimitExceededError

    with pytest.raises(InviteRateLimitExceededError):
        service.create_invite(db, user, space.id)


def test_create_invite_already_in_shared_space(db: Session):
    """
    Verify create invite already in shared space flow.
    Setup: Setup
    """
    # Setup
    user = User(email="admin@example.com", full_name="Admin User")
    owner = User(email="owner@example.com", full_name="Owner User")
    db.add_all([user, owner])
    db.commit()

    space = Space(name="Shared Space", type="shared")
    space_to_invite = Space(name="New Space", type="shared")
    db.add_all([space, space_to_invite])
    db.commit()

    # User is member of space, Owner is admin of space (making it an active shared space with >=2 members)
    db.add(SpaceMember(space_id=space.id, user_id=owner.id, role="admin"))
    db.add(SpaceMember(space_id=space.id, user_id=user.id, role="member"))
    # User is admin of space_to_invite
    db.add(SpaceMember(space_id=space_to_invite.id, user_id=user.id, role="admin"))
    db.commit()

    service = InviteService()
    from spaces.exceptions import AlreadyJoinedSpaceError

    with pytest.raises(AlreadyJoinedSpaceError):
        service.create_invite(db, user, space_to_invite.id)


def test_cancel_invite_success(db: Session):
    """
    Verify cancel invite success flow.
    Setup: Setup
    Assert: Assert status changed to cancelled
    """
    # Setup
    user = User(email="admin@example.com", full_name="Admin")
    db.add(user)
    db.commit()

    space = Space(name="Shared", type="shared")
    db.add(space)
    db.commit()

    member = SpaceMember(space_id=space.id, user_id=user.id, role="admin")
    db.add(member)
    db.commit()

    service = InviteService()
    token = service.create_invite(db, user, space.id)

    # Cancel invite
    service.cancel_invite(db, user, token)

    # Assert status changed to cancelled
    inv = db.query(Invitation).filter(Invitation.token == token).first()
    assert inv is not None
    assert inv.status == "cancelled"


def test_cancel_invite_not_owner(db: Session):
    """
    Verify cancel invite not owner flow.
    Setup: Setup
    """
    # Setup
    user_a = User(email="a@example.com", full_name="A")
    user_b = User(email="b@example.com", full_name="B")
    db.add_all([user_a, user_b])
    db.commit()

    space = Space(name="Shared", type="shared")
    db.add(space)
    db.commit()

    member = SpaceMember(space_id=space.id, user_id=user_a.id, role="admin")
    db.add(member)
    db.commit()

    service = InviteService()
    token = service.create_invite(db, user_a, space.id)

    # Attempt cancel by B (who is not owner/inviter)
    from invites.exceptions import InvitationPermissionDeniedError

    with pytest.raises(InvitationPermissionDeniedError):
        service.cancel_invite(db, user_b, token)


def test_cancel_invite_not_pending(db: Session):
    """
    Verify cancel invite not pending flow.
    Setup: Setup
    """
    # Setup
    user = User(email="a@example.com", full_name="A")
    db.add(user)
    db.commit()

    space = Space(name="Shared", type="shared")
    db.add(space)
    db.commit()

    member = SpaceMember(space_id=space.id, user_id=user.id, role="admin")
    db.add(member)
    db.commit()

    service = InviteService()
    token = service.create_invite(db, user, space.id)

    # Manually change invitation status to accepted
    inv = db.query(Invitation).filter(Invitation.token == token).first()
    assert inv is not None
    inv.status = "accepted"
    db.commit()

    # Attempt cancel
    from invites.exceptions import InvitationNotPendingError

    with pytest.raises(InvitationNotPendingError):
        service.cancel_invite(db, user, token)


def test_decline_invite_success(db: Session):
    """
    Verify decline invite success flow.
    Setup: Setup
    Assert: Assert status changed to declined
    """
    # Setup
    user_a = User(email="a@example.com", full_name="A")
    user_b = User(email="b@example.com", full_name="B")
    db.add_all([user_a, user_b])
    db.commit()

    space = Space(name="Shared", type="shared")
    db.add(space)
    db.commit()

    member = SpaceMember(space_id=space.id, user_id=user_a.id, role="admin")
    db.add(member)
    db.commit()

    service = InviteService()
    token = service.create_invite(db, user_a, space.id)

    # Decline invite
    service.decline_invite(db, user_b, token)

    # Assert status changed to declined
    inv = db.query(Invitation).filter(Invitation.token == token).first()
    assert inv is not None
    assert inv.status == "declined"
