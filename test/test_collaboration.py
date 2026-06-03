import logging
import os
import re
import uuid

from auth.model import User
from auth.service import AuthService
from playwright.sync_api import Browser, Page, expect
from spaces.model import Space, SpaceMember
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


def setup_user_session(page: Page, db_session: Session, email_prefix: str) -> User:
    """Helper to seed user data and authenticate a Playwright page session."""
    unique_id = uuid.uuid4().hex
    user = User(
        email=f"{email_prefix}_{unique_id}@example.com",
        full_name=f"User {email_prefix}",
        picture=None,
    )
    db_session.add(user)
    db_session.commit()

    token = AuthService().create_token(user.id)
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")

    page.on("console", lambda msg: logger.info("%s_LOG: %s", email_prefix, msg.text))
    page.on("pageerror", lambda err: logger.error("%s_ERROR: %s", email_prefix, err))

    # Navigate to site domain context to set localStorage
    page.goto(frontend_url)
    page.evaluate(f"localStorage.setItem('uscornie_token', '{token}')")

    return user


def test_two_users_collaboration(browser: Browser, db_session: Session):
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
    backend_url = os.environ.get("BACKEND_URL", "http://localhost:8000")

    # 1. Create two isolated browser contexts
    context_a = browser.new_context()
    context_b = browser.new_context()

    page_a = context_a.new_page()
    page_b = context_b.new_page()

    # 2. Seed User A and a shared space
    user_a = setup_user_session(page_a, db_session, "usera")

    space = Space(name="Nhà Chung Của Hai Đứa", type="shared")
    db_session.add(space)
    db_session.commit()

    member_a = SpaceMember(space_id=space.id, user_id=user_a.id, role="admin")
    db_session.add(member_a)
    db_session.commit()

    # 3. Seed User B (who is not in the space yet)
    user_b = setup_user_session(page_b, db_session, "userb")

    # 4. User A generates an invitation link via the Dashboard
    page_a.goto(frontend_url)
    expect(page_a).to_have_title(re.compile(r"Uscornie"))

    # Click on "Tạo Link Mời ❤️" button and capture the network response
    invite_url_pattern = re.compile(rf"{backend_url}/invites/{space.id}")
    with page_a.expect_response(invite_url_pattern) as response_info:
        page_a.click("button:has-text('Tạo Link Mời')")

    assert response_info.value.status == 200
    invite_token = response_info.value.json()["invite_token"]
    assert invite_token is not None

    # 5. User B accepts the invitation token via API
    # Generate token for User B's request context
    token_b = AuthService().create_token(user_b.id)

    # We call the join API from page_b request context to register User B into the space
    join_response = page_b.request.post(
        f"{backend_url}/spaces/join",
        headers={"Authorization": f"Bearer {token_b}"},
        data={"invite_token": invite_token},
    )
    assert join_response.ok
    assert join_response.json()["space_id"] == space.id

    # 6. User A navigates to /save and adds an item to the shared space
    page_a.goto(f"{frontend_url}/save")
    expect(page_a).to_have_title(re.compile(r"Save - Uscornie"))

    title_input = page_a.locator("#title-input")
    desc_input = page_a.locator("#desc-input")
    submit_button = page_a.locator("button[type='submit']")

    title_input.fill("Quà sinh nhật cho B")
    desc_input.fill("Một chiếc máy ảnh Polaroid")

    create_url = f"{backend_url}/spaces/{space.id}/items"
    with page_a.expect_response(create_url) as create_resp:
        submit_button.click()

    assert create_resp.value.status == 201

    # Verify item is visible in User A's browser
    expect(page_a.locator("text=Quà sinh nhật cho B")).to_be_visible()

    # 7. User B navigates to /save and should see User A's item immediately (active space prefers shared)
    page_b.goto(f"{frontend_url}/save")
    expect(page_b).to_have_title(re.compile(r"Save - Uscornie"))
    expect(page_b.locator("text=Quà sinh nhật cho B")).to_be_visible()

    # 8. User B edits the item title
    page_b.click("button:has-text('Sửa')")

    title_input_b = page_b.locator("#title-input")
    submit_button_b = page_b.locator("button[type='submit']")

    title_input_b.fill("Quà sinh nhật cho B - đã được duyệt")

    detail_url_pattern = re.compile(rf"{backend_url}/spaces/{space.id}/items/[^/]+")
    with page_b.expect_response(detail_url_pattern) as update_resp:
        submit_button_b.click()

    assert update_resp.value.status == 200

    # 9. User A refreshes / Reloads and sees User B's updates
    page_a.reload()
    expect(page_a.locator("text=Quà sinh nhật cho B - đã được duyệt")).to_be_visible()

    # Clean up contexts
    context_a.close()
    context_b.close()
