from datetime import UTC, datetime, timedelta
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from auth.repository import SessionRepository
from auth.service import AuthService
from models import Space, SpaceMember, User, UserSession


@patch("auth.service.AuthService.verify_google_token")
def test_api_google_login_creates_session_in_db(
    mock_verify, client: TestClient, db: Session
):
    """
    Verify api google login creates session in db flow.
    Action: Call endpoint with custom User-Agent
    Assert: Verify user exists and default personal space was created
    """
    mock_verify.return_value = {
        "email": "test_e2e@example.com",
        "name": "E2E Test User",
        "picture": "https://example.com/e2e.jpg",
    }

    # Call endpoint with custom User-Agent
    response = client.post(
        "/auth/google",
        json={"credential": "mock_google_token"},
        headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

    # Verify cookie is set
    assert "refresh_token" in response.cookies
    session_id = response.cookies["refresh_token"]

    # Verify session is in DB
    session = db.query(UserSession).filter(UserSession.id == session_id).first()
    assert session is not None
    assert session.is_active is True
    assert session.ip_address == "testclient"
    assert isinstance(session.device_info, dict)
    assert session.device_info["browser"]["family"] == "Chrome"
    assert session.device_info["os"]["family"] == "Mac OS X"

    # Verify user exists and default personal space was created
    user = db.query(User).filter(User.email == "test_e2e@example.com").first()
    assert user is not None
    assert user.full_name == "E2E Test User"

    member = db.query(SpaceMember).filter(SpaceMember.user_id == user.id).first()
    assert member is not None
    assert member.role == "admin"
    space = db.query(Space).filter(Space.id == member.space_id).first()
    assert space is not None
    assert space.type == "personal"


@pytest.mark.parametrize(
    (
        "user_agent",
        "expected_browser",
        "expected_os",
        "expected_device",
        "cf_ip",
        "expected_ip",
    ),
    [
        (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Chrome",
            "Windows",
            "Other",
            "1.1.1.1",
            "1.1.1.1",
        ),
        (
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1.1 Mobile/15E148 Safari/604.1",
            "Mobile Safari",
            "iOS",
            "iPhone",
            None,
            "testclient",
        ),
        (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
            "Edge",
            "Windows",
            "Other",
            "203.0.113.195",
            "203.0.113.195",
        ),
        (
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
            "Chrome Mobile",
            "Android",
            "K",
            None,
            "testclient",
        ),
        (
            "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
            "Googlebot",
            "Other",
            "Spider",
            None,
            "testclient",
        ),
    ],
)
@patch("auth.service.AuthService.verify_google_token")
def test_api_google_login_user_agent_variations(
    mock_verify,
    client: TestClient,
    db: Session,
    user_agent,
    expected_browser,
    expected_os,
    expected_device,
    cf_ip,
    expected_ip,
):
    """
    Verify api google login user agent variations flow.
    Execute standard test flow for test_api_google_login_user_agent_variations.
    """
    # Dynamic email for unique users per test parameters
    email = f"ua_test_{expected_browser.lower().replace(' ', '_')}@example.com"
    mock_verify.return_value = {
        "email": email,
        "name": "UA Test User",
        "picture": "https://example.com/ua.jpg",
    }

    headers = {"User-Agent": user_agent}
    if cf_ip:
        headers["CF-Connecting-IP"] = cf_ip

    response = client.post(
        "/auth/google",
        json={"credential": "mock_google_token"},
        headers=headers,
    )

    assert response.status_code == 200
    session_id = response.cookies["refresh_token"]

    session = db.query(UserSession).filter(UserSession.id == session_id).first()
    assert session is not None
    assert session.ip_address == expected_ip
    assert isinstance(session.device_info, dict)
    assert session.device_info["browser"]["family"] == expected_browser
    assert session.device_info["os"]["family"] == expected_os
    assert session.device_info["device"]["family"] == expected_device
    assert session.device_info["raw"] == user_agent


def test_api_refresh_token_rotation_success(client: TestClient, db: Session):
    """
    Verify api refresh token rotation success flow.
    Setup: Create user and an active session
    Action: Refresh using the session ID as cookie
    Assert: Verify old session is inactive and has child
    """
    # Setup: Create user and an active session
    user = User(email="rotate@example.com", full_name="Rotate User")
    db.add(user)
    db.commit()

    repo = SessionRepository()
    session = repo.create_session(
        db, user_id=user.id, device_info={"raw": "Test Device"}, ip_address="127.0.0.1"
    )

    # Action: Refresh using the session ID as cookie
    client.cookies.set("refresh_token", session.id)
    response = client.post("/auth/refresh")

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

    # Assert new cookie is set and is different
    new_session_id = response.cookies.get("refresh_token")
    assert new_session_id is not None
    assert new_session_id != session.id

    # Verify old session is inactive and has child
    db.refresh(session)
    assert session.is_active is False

    new_session = db.query(UserSession).filter(UserSession.id == new_session_id).first()
    assert new_session is not None
    assert new_session.is_active is True
    assert new_session.parent_id == session.id


def test_api_refresh_token_expired(client: TestClient, db: Session):
    """
    Verify api refresh token expired flow.
    Setup: Create user and an expired session
    """
    # Setup: Create user and an expired session
    user = User(email="expired@example.com", full_name="Expired User")
    db.add(user)
    db.commit()

    expires_at = datetime.now(UTC) - timedelta(days=1)
    session = UserSession(
        user_id=user.id,
        device_info={"raw": "Test Device"},
        ip_address="127.0.0.1",
        expires_at=expires_at,
        is_active=True,
    )
    db.add(session)
    db.commit()

    client.cookies.set("refresh_token", session.id)
    response = client.post("/auth/refresh")

    assert response.status_code == 401
    assert response.json()["error_code"] == "SESSION_EXPIRED"

    db.refresh(session)
    assert session.is_active is False


def test_api_replay_attack_revokes_all_user_sessions(client: TestClient, db: Session):
    """
    Verify api replay attack revokes all user sessions flow.
    Setup: Create user with multiple active sessions
    Assert: Verify both active sessions B and C are now revoked (is_active = False)
    """
    # Setup: Create user with multiple active sessions
    user = User(email="replay@example.com", full_name="Replay User")
    db.add(user)
    db.commit()

    repo = SessionRepository()
    # Logged in devices: Session A (rotated), Session B (descendant of A), Session C (independent active session)
    session_a = UserSession(
        user_id=user.id,
        device_info={"raw": "Device 1"},
        ip_address="127.0.0.1",
        expires_at=datetime.now(UTC) + timedelta(days=30),
        is_active=False,
    )
    db.add(session_a)
    db.commit()

    session_b = repo.create_session(
        db,
        user_id=user.id,
        device_info={"raw": "Device 1"},
        ip_address="127.0.0.1",
        parent_id=session_a.id,
    )
    session_c = repo.create_session(
        db, user_id=user.id, device_info={"raw": "Device 2"}, ip_address="192.168.1.1"
    )

    # Replay attack: client tries to refresh using Session A (which is already rotated/inactive)
    client.cookies.set("refresh_token", session_a.id)
    response = client.post("/auth/refresh")

    assert response.status_code == 401
    assert response.json()["error_code"] == "SESSION_REUSED"

    # Verify both active sessions B and C are now revoked (is_active = False)
    db.refresh(session_b)
    db.refresh(session_c)
    assert session_b.is_active is False
    assert session_c.is_active is False


def test_api_logout_invalidates_current_session(client: TestClient, db: Session):
    """
    Verify api logout invalidates current session flow.
    Assert: Verify cookie is deleted/cleared
    """
    user = User(email="logout@example.com", full_name="Logout User")
    db.add(user)
    db.commit()

    repo = SessionRepository()
    session = repo.create_session(
        db, user_id=user.id, device_info={"raw": "Device"}, ip_address="127.0.0.1"
    )

    client.cookies.set("refresh_token", session.id)
    response = client.post("/auth/logout")

    assert response.status_code == 200
    assert response.json()["detail"] == "Logout successful"

    # Verify cookie is deleted/cleared
    # Note: response.cookies.get("refresh_token") might be "" or None or missing. Let's inspect cookies
    cookie = response.cookies.get("refresh_token")
    assert cookie is None or cookie == ""

    db.refresh(session)
    assert session.is_active is False


def test_api_get_sessions_list(client: TestClient, db: Session):
    """
    Verify api get sessions list flow.
    Execute standard test flow for test_api_get_sessions_list.
    """
    user = User(email="sessions@example.com", full_name="Sessions User")
    db.add(user)
    db.commit()

    repo = SessionRepository()
    session_a = repo.create_session(
        db, user_id=user.id, device_info={"raw": "Device A"}, ip_address="127.0.0.1"
    )
    session_b = repo.create_session(
        db, user_id=user.id, device_info={"raw": "Device B"}, ip_address="192.168.1.1"
    )

    # Generate access token
    auth_service = AuthService()
    jwt_token = auth_service.create_token(user.id)

    client.cookies.set("refresh_token", session_a.id)
    response = client.get(
        "/auth/sessions", headers={"Authorization": f"Bearer {jwt_token}"}
    )

    assert response.status_code == 200
    sessions_list = response.json()
    assert len(sessions_list) == 2

    # Check mapping
    sessions_map = {s["id"]: s for s in sessions_list}
    assert session_a.id in sessions_map
    assert session_b.id in sessions_map

    assert sessions_map[session_a.id]["is_current"] is True
    assert sessions_map[session_b.id]["is_current"] is False
    assert sessions_map[session_b.id]["device_info"] == {"raw": "Device B"}


def test_api_revoke_specific_device_session(client: TestClient, db: Session):
    """
    Verify api revoke specific device session flow.
    Execute standard test flow for test_api_revoke_specific_device_session.
    """
    user = User(email="revoke@example.com", full_name="Revoke User")
    db.add(user)
    db.commit()

    repo = SessionRepository()
    session_a = repo.create_session(
        db, user_id=user.id, device_info={"raw": "Device A"}, ip_address="127.0.0.1"
    )
    session_b = repo.create_session(
        db, user_id=user.id, device_info={"raw": "Device B"}, ip_address="192.168.1.1"
    )

    auth_service = AuthService()
    jwt_token = auth_service.create_token(user.id)

    # Revoke Session B using Session A's authentication
    response = client.delete(
        f"/auth/sessions/{session_b.id}",
        headers={"Authorization": f"Bearer {jwt_token}"},
    )

    assert response.status_code == 200
    assert response.json()["detail"] == "Session revoked successfully"

    db.refresh(session_a)
    db.refresh(session_b)
    assert session_a.is_active is True
    assert session_b.is_active is False


def test_api_rbac_space_access(client: TestClient, db: Session):
    """
    Verify api rbac space access flow.
    Setup: Setup User A (owner) and User B (outsider)
    Action: Action 2: Make User B a member of Space A and try again (should succeed 200)
    """
    # Setup User A (owner) and User B (outsider)
    user_a = User(email="usera@example.com", full_name="User A")
    user_b = User(email="userb@example.com", full_name="User B")
    db.add_all([user_a, user_b])
    db.commit()

    # Create a shared space owned by User A
    space = Space(name="Space A", type="shared")
    db.add(space)
    db.commit()

    member_a = SpaceMember(space_id=space.id, user_id=user_a.id, role="admin")
    db.add(member_a)
    db.commit()

    auth_service = AuthService()
    jwt_b = auth_service.create_token(user_b.id)

    # Action 1: User B tries to create an invitation for Space A (should be denied 403)
    response = client.post(
        f"/invites/{space.id}", headers={"Authorization": f"Bearer {jwt_b}"}
    )
    assert response.status_code == 403
    assert "Bạn không có quyền truy cập không gian này" in response.json()["message"]

    # Action 2: Make User B a member of Space A and try again (should succeed 200)
    member_b = SpaceMember(space_id=space.id, user_id=user_b.id, role="member")
    db.add(member_b)
    db.commit()

    response = client.post(
        f"/invites/{space.id}", headers={"Authorization": f"Bearer {jwt_b}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "invite_token" in data
    assert "url" in data
