from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from auth.service import AuthService
from models import Invitation, Space, SpaceMember, User


def test_get_invite_status_success(client: TestClient, db: Session):
    """
    Verify get invite status success flow.
    Setup: Setup User and Shared Space
    Action: Call status endpoint
    """
    # Setup User and Shared Space
    host = User(email="host@example.com", full_name="Host")
    db.add(host)
    db.commit()

    space = Space(name="Shared Space", type="shared")
    db.add(space)
    db.commit()

    db.add(SpaceMember(space_id=space.id, user_id=host.id, role="admin"))
    db.commit()

    invitation = Invitation(
        token="valid-token-status",
        space_id=space.id,
        inviter_id=host.id,
        status="pending",
    )
    db.add(invitation)
    db.commit()

    # Call status endpoint
    response = client.get("/invites/valid-token-status/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "pending"
    assert data["creator"]["full_name"] == "Host"


def test_patch_invite_cancel_success(client: TestClient, db: Session):
    """
    Verify patch invite cancel success flow.
    Setup: Setup
    """
    # Setup
    host = User(email="host@example.com", full_name="Host")
    db.add(host)
    db.commit()

    space = Space(name="Shared Space", type="shared")
    db.add(space)
    db.commit()

    db.add(SpaceMember(space_id=space.id, user_id=host.id, role="admin"))
    db.commit()

    invitation = Invitation(
        token="token-cancel", space_id=space.id, inviter_id=host.id, status="pending"
    )
    db.add(invitation)
    db.commit()

    # Auth headers for Host
    token = AuthService().create_token(host.id)
    headers = {"Authorization": f"Bearer {token}"}

    # Cancel invite via PATCH
    response = client.patch(
        "/invites/token-cancel", json={"status": "cancelled"}, headers=headers
    )
    assert response.status_code == 200
    assert response.json()["status"] == "cancelled"


def test_patch_invite_decline_success(client: TestClient, db: Session):
    """
    Verify patch invite decline success flow.
    Setup: Setup
    """
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
        token="token-decline", space_id=space.id, inviter_id=host.id, status="pending"
    )
    db.add(invitation)
    db.commit()

    # Auth headers for Guest
    token = AuthService().create_token(guest.id)
    headers = {"Authorization": f"Bearer {token}"}

    # Decline invite via PATCH
    response = client.patch(
        "/invites/token-decline", json={"status": "declined"}, headers=headers
    )
    assert response.status_code == 200
    assert response.json()["status"] == "declined"


def test_get_space_stats_success(client: TestClient, db: Session):
    """
    Verify get space stats success flow.
    Setup: Setup
    """
    from models import Item

    # Setup
    host = User(email="host@example.com", full_name="Host")
    db.add(host)
    db.commit()

    space = Space(name="Shared Space", type="shared")
    db.add(space)
    db.commit()

    db.add(SpaceMember(space_id=space.id, user_id=host.id, role="admin"))
    db.commit()

    # Add items to space
    item1 = Item(space_id=space.id, category="memories", title="Memory 1")
    item2 = Item(space_id=space.id, category="wishlist", title="Wishlist 1")
    db.add_all([item1, item2])
    db.commit()

    # Auth headers
    token = AuthService().create_token(host.id)
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get(f"/spaces/{space.id}/stats", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert data["categories"]["memories"] == 1
    assert data["categories"]["wishlist"] == 1
