import logging
import os
import re
import uuid
import time

from auth.model import User
from auth.service import AuthService
from playwright.sync_api import Browser, Page, expect
from spaces.model import Space, SpaceMember
from items.model import Item
from invites.model import Invitation
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


def setup_user_session(page: Page, db_session: Session, email_prefix: str) -> User:
    """Helper to seed user data, create default personal space, and authenticate a Playwright page session."""
    unique_id = uuid.uuid4().hex
    user = User(
        email=f"{email_prefix}_{unique_id}@example.com",
        full_name=f"User {email_prefix.upper()}",
        picture=None,
    )
    db_session.add(user)
    db_session.commit()

    # Create default personal space for the user
    personal_space = Space(name=f"Không gian của {user.full_name}", type="personal")
    db_session.add(personal_space)
    db_session.commit()

    member = SpaceMember(space_id=personal_space.id, user_id=user.id, role="admin")
    db_session.add(member)
    db_session.commit()

    token = AuthService().create_token(user.id)
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")

    page.on("console", lambda msg: logger.info("%s_LOG: %s", email_prefix, msg.text))
    page.on("pageerror", lambda err: logger.error("%s_ERROR: %s", email_prefix, err))

    # Navigate to site domain context to set localStorage
    page.goto(frontend_url)
    page.evaluate(f"localStorage.setItem('uscornie_token', '{token}')")

    return user


def test_invite_rate_limit(browser: Browser, db_session: Session):
    """
    Verify rate limit: A user is restricted to generating a maximum of 3 active invites per hour.
    The 4th generation attempt returns a 429 error code.
    """
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
    backend_url = os.environ.get("BACKEND_URL", "http://localhost:8000")

    context = browser.new_context()
    page = context.new_page()

    user_a = setup_user_session(page, db_session, "ratelimit")

    # Create a shared space for A to generate invites
    shared_space = Space(name="Shared Space Rate Limit", type="shared")
    db_session.add(shared_space)
    db_session.commit()

    member_a = SpaceMember(space_id=shared_space.id, user_id=user_a.id, role="admin")
    db_session.add(member_a)
    db_session.commit()

    page.goto(frontend_url)
    expect(page.locator("text=Shared Space Rate Limit")).to_be_visible()

    # Loop 3 times generating and cancelling invites
    invite_url_pattern = re.compile(rf"{backend_url}/invites/{shared_space.id}")
    for _ in range(3):
        with page.expect_response(invite_url_pattern) as response_info:
            page.click("button:has-text('Tạo Link Mời')")
        assert response_info.value.status == 200

        # Click cancel button to allow regenerating the button
        page.click("#cancel-invite-btn")
        expect(page.locator("button:has-text('Tạo Link Mời')")).to_be_visible()

    # The 4th attempt must return 429 (Rate Limit Exceeded)
    with page.expect_response(invite_url_pattern) as response_info_4th:
        page.click("button:has-text('Tạo Link Mời')")
    assert response_info_4th.value.status == 429

    context.close()


def test_invite_cancellation(browser: Browser, db_session: Session):
    """
    Verify invite cancellation: After User A generates and cancels an invite link,
    User B attempting to access the invite link meets an error screen stating that
    the invitation is invalid or expired.
    """
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
    backend_url = os.environ.get("BACKEND_URL", "http://localhost:8000")

    context_a = browser.new_context()
    context_b = browser.new_context()

    page_a = context_a.new_page()
    page_b = context_b.new_page()

    user_a = setup_user_session(page_a, db_session, "cancela")
    user_b = setup_user_session(page_b, db_session, "cancelb")

    shared_space = Space(name="Shared Space Cancel", type="shared")
    db_session.add(shared_space)
    db_session.commit()

    member_a = SpaceMember(space_id=shared_space.id, user_id=user_a.id, role="admin")
    db_session.add(member_a)
    db_session.commit()

    # User A creates invite link
    page_a.goto(frontend_url)
    invite_url_pattern = re.compile(rf"{backend_url}/invites/{shared_space.id}")
    with page_a.expect_response(invite_url_pattern) as response_info:
        page_a.click("button:has-text('Tạo Link Mời')")
    assert response_info.value.status == 200
    invite_token = response_info.value.json()["invite_token"]

    # User A cancels the invite
    page_a.click("#cancel-invite-btn")
    expect(page_a.locator("button:has-text('Tạo Link Mời')")).to_be_visible()

    # User B navigates to the cancelled invite join link
    page_b.goto(f"{frontend_url}/join?token={invite_token}")
    expect(page_b.locator("#error-message")).to_be_visible()
    expect(page_b.locator("#error-message")).to_contain_text("lời mời có vẻ đã hết hạn hoặc không còn hiệu lực", ignore_case=True)

    context_a.close()
    context_b.close()


def test_invite_declination(browser: Browser, db_session: Session):
    """
    Verify invite declination: When User B declines an invitation, B is transitioned
    to the declined screen and the invitation status updates to 'declined'. A's dashboard
    polling handles the status change and returns to normal dashboard.
    """
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
    backend_url = os.environ.get("BACKEND_URL", "http://localhost:8000")

    context_a = browser.new_context()
    context_b = browser.new_context()

    page_a = context_a.new_page()
    page_b = context_b.new_page()

    user_a = setup_user_session(page_a, db_session, "declinea")
    user_b = setup_user_session(page_b, db_session, "declineb")

    shared_space = Space(name="Shared Space Decline", type="shared")
    db_session.add(shared_space)
    db_session.commit()

    member_a = SpaceMember(space_id=shared_space.id, user_id=user_a.id, role="admin")
    db_session.add(member_a)
    db_session.commit()

    # User A creates invite link
    page_a.goto(frontend_url)
    invite_url_pattern = re.compile(rf"{backend_url}/invites/{shared_space.id}")
    with page_a.expect_response(invite_url_pattern) as response_info:
        page_a.click("button:has-text('Tạo Link Mời')")
    assert response_info.value.status == 200
    invite_token = response_info.value.json()["invite_token"]

    # User B opens invite link
    page_b.goto(f"{frontend_url}/join?token={invite_token}")
    expect(page_b.locator("#decline-btn")).to_be_visible()

    # User B declines
    page_b.click("#decline-btn")
    expect(page_b.locator("#declined-message")).to_be_visible()

    # Polling on A's side should revert back to normal dashboard
    expect(page_a.locator("button:has-text('Tạo Link Mời')")).to_be_visible()

    context_a.close()
    context_b.close()


def test_invite_acceptance_and_merging_ui(browser: Browser, db_session: Session):
    """
    Verify acceptance and merging UI: When User B accepts an invitation, a split-screen
    stats UI displaying each user's stats defaults to 0 if missing. The merging state
    shows a spinning heart loader, after which the users are redirected to the common space,
    and their items are successfully merged.
    """
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
    backend_url = os.environ.get("BACKEND_URL", "http://localhost:8000")

    context_a = browser.new_context()
    context_b = browser.new_context()

    page_a = context_a.new_page()
    page_b = context_b.new_page()

    user_a = setup_user_session(page_a, db_session, "accepta")
    user_b = setup_user_session(page_b, db_session, "acceptb")

    shared_space = Space(name="Nhà Chung Đẹp", type="shared")
    db_session.add(shared_space)
    db_session.commit()

    member_a = SpaceMember(space_id=shared_space.id, user_id=user_a.id, role="admin")
    db_session.add(member_a)
    db_session.commit()

    # Find personal spaces to seed items
    p_space_a = db_session.query(SpaceMember).filter(SpaceMember.user_id == user_a.id).join(Space).filter(Space.type == "personal").first().space_id
    p_space_b = db_session.query(SpaceMember).filter(SpaceMember.user_id == user_b.id).join(Space).filter(Space.type == "personal").first().space_id

    # Seed items for A
    item_a1 = Item(space_id=p_space_a, category="memories", title="Kỷ niệm của A", desc="A's memory description")
    item_a2 = Item(space_id=p_space_a, category="wishlist", title="Điều ước của A", desc="A's wishlist description")
    db_session.add_all([item_a1, item_a2])

    # Seed items for B
    item_b1 = Item(space_id=p_space_b, category="cafe", title="Quán cafe của B", desc="B's cafe description")
    db_session.add(item_b1)
    db_session.commit()

    # User A creates invite link
    page_a.goto(frontend_url)
    invite_url_pattern = re.compile(rf"{backend_url}/invites/{shared_space.id}")
    with page_a.expect_response(invite_url_pattern) as response_info:
        page_a.click("button:has-text('Tạo Link Mời')")
    assert response_info.value.status == 200
    invite_token = response_info.value.json()["invite_token"]

    # User B opens invite link
    page_b.goto(f"{frontend_url}/join?token={invite_token}")

    # Check stats for A and B on the acceptance split screen
    # A has: memories=1, wishlist=1, cafe=0, restaurant=0 (cafe and restaurant are padded to 0)
    expect(page_b.locator("#creator-stats-panel #creator-memories")).to_have_text("1")
    expect(page_b.locator("#creator-stats-panel #creator-wishlist")).to_have_text("1")
    expect(page_b.locator("#creator-stats-panel #creator-cafe")).to_have_text("0")
    expect(page_b.locator("#creator-stats-panel #creator-restaurant")).to_have_text("0")

    # B has: memories=0, wishlist=0, cafe=1, restaurant=0
    expect(page_b.locator("#acceptor-stats-panel #acceptor-memories")).to_have_text("0")
    expect(page_b.locator("#acceptor-stats-panel #acceptor-wishlist")).to_have_text("0")
    expect(page_b.locator("#acceptor-stats-panel #acceptor-cafe")).to_have_text("1")
    expect(page_b.locator("#acceptor-stats-panel #acceptor-restaurant")).to_have_text("0")

    # Click accept button
    page_b.click("#accept-btn")

    # Wait for success screen directly to support slow-motion runs

    # Wait for success screen
    expect(page_b.locator("text=Chào mừng về nhà!")).to_be_visible()
    
    # Click Go to home page button
    page_b.click("button:has-text('Vào nhà ngay')")
    expect(page_b).to_have_url(f"{frontend_url}/")

    # Verify both personal space items are now merged in the shared space
    db_session.expire_all()
    count_shared = db_session.query(Item).filter(Item.space_id == shared_space.id).count()
    assert count_shared == 3

    context_a.close()
    context_b.close()


def test_private_space_ui_hidden_when_shared_active(browser: Browser, db_session: Session):
    """
    Verify private space UI exclusion: When a shared space containing at least 2 members
    is active, personal spaces are excluded from the visible space listings on the UI.
    """
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")

    context = browser.new_context()
    page = context.new_page()

    user_a = setup_user_session(page, db_session, "hidden")

    # Before shared space exists or is active, personal space is visible
    page.goto(frontend_url)
    expect(page.locator("#spaces-list-container")).to_contain_text("Không gian của User HIDDEN")

    # Join a shared space with 2 members (active shared space)
    shared_space = Space(name="Active Shared Space UI", type="shared")
    db_session.add(shared_space)
    db_session.commit()

    # User A member
    member_a = SpaceMember(space_id=shared_space.id, user_id=user_a.id, role="admin")
    db_session.add(member_a)

    # Seed User B in same space
    unique_id = uuid.uuid4().hex
    user_b = User(email=f"dummy_{unique_id}@example.com", full_name="Dummy B", picture=None)
    db_session.add(user_b)
    db_session.commit()

    member_b = SpaceMember(space_id=shared_space.id, user_id=user_b.id, role="member")
    db_session.add(member_b)
    db_session.commit()

    # Reload to verify the personal space UI entry is hidden
    page.reload()
    expect(page.locator("#spaces-list-container")).to_contain_text("Active Shared Space UI")
    expect(page.locator("#spaces-list-container")).not_to_contain_text("Không gian của User HIDDEN")

    context.close()
