from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from auth.service import AuthService
from items.model import Item
from models import Space, SpaceMember, User


def test_api_items_crud_flow_success(client: TestClient, db: Session):
    # Setup User and their personal space
    user = User(email="tester@example.com", full_name="Tester")
    db.add(user)
    db.commit()

    space = Space(name="Tester's Space", type="personal")
    db.add(space)
    db.commit()

    member = SpaceMember(space_id=space.id, user_id=user.id, role="admin")
    db.add(member)
    db.commit()

    # Generate authorization header
    auth_service = AuthService()
    jwt_token = auth_service.create_token(user.id)
    headers = {"Authorization": f"Bearer {jwt_token}"}

    # 1. Create a Save Item
    payload = {
        "category": "movies",
        "title": "Inception",
        "desc": "A mind-bending sci-fi thriller",
        "tag": "Sci-Fi",
    }
    response = client.post(
        f"/spaces/{space.id}/items",
        json=payload,
        headers=headers,
    )
    assert response.status_code == 201
    created_data = response.json()
    assert created_data["id"] is not None
    assert created_data["title"] == "Inception"
    assert created_data["category"] == "movies"
    assert created_data["tag"] == "Sci-Fi"

    item_id = created_data["id"]

    # 2. Get Items (with category filter)
    response = client.get(
        f"/spaces/{space.id}/items?category=movies",
        headers=headers,
    )
    assert response.status_code == 200
    items_list = response.json()
    assert len(items_list) == 1
    assert items_list[0]["id"] == item_id
    assert items_list[0]["title"] == "Inception"

    # 3. Update the Item
    update_payload = {
        "title": "Inception (Extended)",
        "desc": "A mind-bending thriller with extra scenes",
        "tag": "Sci-Fi / Action",
    }
    response = client.put(
        f"/spaces/{space.id}/items/{item_id}",
        json=update_payload,
        headers=headers,
    )
    assert response.status_code == 200
    updated_data = response.json()
    assert updated_data["title"] == "Inception (Extended)"
    assert updated_data["desc"] == "A mind-bending thriller with extra scenes"
    assert updated_data["tag"] == "Sci-Fi / Action"

    # 4. Delete the Item
    response = client.delete(
        f"/spaces/{space.id}/items/{item_id}",
        headers=headers,
    )
    assert response.status_code == 204

    # 5. Get items after delete to confirm empty list
    response = client.get(
        f"/spaces/{space.id}/items",
        headers=headers,
    )
    assert response.status_code == 200
    assert len(response.json()) == 0


def test_api_items_unauthorized_access(client: TestClient, db: Session):
    # Setup two users with their own personal spaces
    user_a = User(email="a@example.com", full_name="User A")
    user_b = User(email="b@example.com", full_name="User B")
    db.add_all([user_a, user_b])
    db.commit()

    space_a = Space(name="Space A", type="personal")
    space_b = Space(name="Space B", type="personal")
    db.add_all([space_a, space_b])
    db.commit()

    member_a = SpaceMember(space_id=space_a.id, user_id=user_a.id, role="admin")
    member_b = SpaceMember(space_id=space_b.id, user_id=user_b.id, role="admin")
    db.add_all([member_a, member_b])
    db.commit()

    # User B adds an item in Space B
    item_b = Item(
        space_id=space_b.id,
        category="books",
        title="Dune",
        desc="Sci-fi epic",
    )
    db.add(item_b)
    db.commit()

    # Generate JWT for User A
    auth_service = AuthService()
    jwt_a = auth_service.create_token(user_a.id)
    headers_a = {"Authorization": f"Bearer {jwt_a}"}

    # Action 1: User A tries to list items of Space B (403 Forbidden)
    response = client.get(
        f"/spaces/{space_b.id}/items",
        headers=headers_a,
    )
    assert response.status_code == 403
    assert "Bạn không phải thành viên của không gian này" in response.json()["message"]

    # Action 2: User A tries to create an item in Space B (403 Forbidden)
    response = client.post(
        f"/spaces/{space_b.id}/items",
        json={"category": "wishlist", "title": "Sneakers"},
        headers=headers_a,
    )
    assert response.status_code == 403

    # Action 3: User A tries to update User B's item (403 Forbidden)
    response = client.put(
        f"/spaces/{space_b.id}/items/{item_b.id}",
        json={"title": "Hacked Book Name"},
        headers=headers_a,
    )
    assert response.status_code == 403

    # Action 4: User A tries to delete User B's item (403 Forbidden)
    response = client.delete(
        f"/spaces/{space_b.id}/items/{item_b.id}",
        headers=headers_a,
    )
    assert response.status_code == 403


def test_api_items_not_found(client: TestClient, db: Session):
    # Setup User and their personal space
    user = User(email="tester@example.com", full_name="Tester")
    db.add(user)
    db.commit()

    space = Space(name="Tester's Space", type="personal")
    db.add(space)
    db.commit()

    member = SpaceMember(space_id=space.id, user_id=user.id, role="admin")
    db.add(member)
    db.commit()

    # Generate authorization header
    auth_service = AuthService()
    jwt_token = auth_service.create_token(user.id)
    headers = {"Authorization": f"Bearer {jwt_token}"}

    # Attempt to update a non-existent item (404 Not Found)
    response = client.put(
        f"/spaces/{space.id}/items/non-existent-id",
        json={"title": "Updated"},
        headers=headers,
    )
    assert response.status_code == 404
    assert "Mục lưu trữ không tồn tại." in response.json()["message"]

    # Attempt to delete a non-existent item (404 Not Found)
    response = client.delete(
        f"/spaces/{space.id}/items/non-existent-id",
        headers=headers,
    )
    assert response.status_code == 404
