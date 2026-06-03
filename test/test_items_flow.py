import logging
import os
import re
import uuid

from auth.model import User
from auth.service import AuthService
from items.model import Item
from playwright.sync_api import Page, expect
from spaces.model import Space, SpaceMember
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


def setup_authenticated_session(page: Page, db_session: Session) -> tuple[User, Space]:
    """Helper to seed user/space data and authenticate Playwright session."""
    unique_id = uuid.uuid4().hex
    user = User(
        email=f"testuser_{unique_id}@example.com", full_name="Test User", picture=None
    )
    db_session.add(user)
    db_session.commit()

    space = Space(name="Test Shared Space", type="shared")
    db_session.add(space)
    db_session.commit()

    member = SpaceMember(space_id=space.id, user_id=user.id, role="admin")
    db_session.add(member)
    db_session.commit()

    token = AuthService().create_token(user.id)
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")

    page.on("console", lambda msg: logger.info("BROWSER_LOG: %s", msg.text))
    page.on("pageerror", lambda err: logger.error("BROWSER_ERROR: %s", err))

    # Navigate to site domain context to set localStorage
    page.goto(frontend_url)
    page.evaluate(f"localStorage.setItem('uscornie_token', '{token}')")

    return user, space


def test_create_item_as_authenticated_user(page: Page, db_session: Session):
    _user, space = setup_authenticated_session(page, db_session)
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")

    # Navigate to save page
    page.goto(f"{frontend_url}/save")
    expect(page).to_have_title(re.compile(r"Save - Uscornie"))

    title_input = page.locator("#title-input")
    desc_input = page.locator("#desc-input")
    submit_button = page.locator("button[type='submit']")

    # Check initially empty state
    expect(page.locator("text=Chưa có gì ở đây cả")).to_be_visible()

    # Fill and submit form
    title_input.fill("Sách Học Docker và Kubernetes")
    desc_input.fill("Cuốn sách rất hay về DevOps và Containerization")

    backend_url = os.environ.get("BACKEND_URL", "http://localhost:8000")
    create_url = f"{backend_url}/spaces/{space.id}/items"

    with page.expect_response(create_url) as response_info:
        submit_button.click()

    assert response_info.value.status == 201
    assert response_info.value.json()["title"] == "Sách Học Docker và Kubernetes"

    # Verify updated UI and Database
    expect(page.locator("text=Sách Học Docker và Kubernetes")).to_be_visible()

    created_item = (
        db_session.query(Item).filter_by(title="Sách Học Docker và Kubernetes").first()
    )
    assert created_item is not None
    assert created_item.space_id == space.id


def test_update_item_as_authenticated_user(page: Page, db_session: Session):
    _user, space = setup_authenticated_session(page, db_session)
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")

    # Seed an existing item directly into the database
    existing_item = Item(
        space_id=space.id, category="wishlist", title="Sách Cũ Docker", desc="Mô tả cũ"
    )
    db_session.add(existing_item)
    db_session.commit()
    item_id = existing_item.id

    # 3. Navigate to save page and wait for the items API response to avoid race conditions
    backend_url = os.environ.get("BACKEND_URL", "http://localhost:8000")
    items_url = f"{backend_url}/spaces/{space.id}/items"

    with page.expect_response(items_url) as response_info:
        page.goto(f"{frontend_url}/save")

    expect(page).to_have_title(re.compile(r"Save - Uscornie"))
    assert response_info.value.status == 200

    # Verify the item is listed in the UI
    expect(page.locator("text=Sách Cũ Docker")).to_be_visible()

    # Trigger Edit flow
    page.click("button:has-text('Sửa')")

    title_input = page.locator("#title-input")
    desc_input = page.locator("#desc-input")
    submit_button = page.locator("button[type='submit']")

    expect(title_input).to_have_value("Sách Cũ Docker")

    # Edit fields
    title_input.fill("Sách Mới Docker")
    desc_input.fill("Mô tả mới")

    detail_url_pattern = re.compile(rf"{backend_url}/spaces/{space.id}/items/[^/]+")

    with page.expect_response(detail_url_pattern) as edit_response_info:
        submit_button.click()

    assert edit_response_info.value.status == 200
    assert edit_response_info.value.json()["title"] == "Sách Mới Docker"

    # Verify updated database state
    db_session.expire_all()
    updated_item = db_session.query(Item).filter_by(id=item_id).first()
    assert updated_item is not None
    assert updated_item.title == "Sách Mới Docker"
    assert updated_item.desc == "Mô tả mới"


def test_delete_item_as_authenticated_user(page: Page, db_session: Session):
    _user, space = setup_authenticated_session(page, db_session)
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")

    # Seed an existing item directly into the database
    existing_item = Item(
        space_id=space.id, category="wishlist", title="Sách Cần Xoá", desc="Mô tả xoá"
    )
    db_session.add(existing_item)
    db_session.commit()
    item_id = existing_item.id

    # Navigate to save page and wait for the items API response to avoid race conditions
    backend_url = os.environ.get("BACKEND_URL", "http://localhost:8000")
    items_url = f"{backend_url}/spaces/{space.id}/items"

    with page.expect_response(items_url) as response_info:
        page.goto(f"{frontend_url}/save")

    expect(page).to_have_title(re.compile(r"Save - Uscornie"))
    assert response_info.value.status == 200

    expect(page.locator("text=Sách Cần Xoá")).to_be_visible()

    # Intercept confirm dialog and accept it
    page.on("dialog", lambda dialog: dialog.accept())

    detail_url_pattern = re.compile(rf"{backend_url}/spaces/{space.id}/items/[^/]+")

    with page.expect_response(detail_url_pattern) as delete_response_info:
        page.click("button:has-text('Xoá')")

    assert delete_response_info.value.status in (200, 204)

    # Verify removed from UI and Database
    expect(page.locator("text=Sách Cần Xoá")).not_to_be_visible()

    db_session.expire_all()
    deleted_item = db_session.query(Item).filter_by(id=item_id).first()
    assert deleted_item is None
