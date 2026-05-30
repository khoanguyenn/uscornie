import pytest
from sqlalchemy.orm import Session

from invites.exceptions import PersonalSpaceInviteError
from invites.service import InviteService
from models import Invitation, Space, SpaceMember, User
from spaces.exceptions import NotSpaceMemberError


def test_create_invite_success(db: Session):
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
