import pytest
from sqlalchemy.orm import Session

from items.exceptions import ItemNotFoundError
from items.service import ItemService
from models import Space, SpaceMember, User
from spaces.exceptions import NotSpaceMemberError


def test_personal_space_crud(db: Session):
    # Setup users and personal space
    user = User(email="alice@example.com", full_name="Alice")
    db.add(user)
    db.commit()

    space = Space(name="Alice's Space", type="personal")
    db.add(space)
    db.commit()

    member = SpaceMember(space_id=space.id, user_id=user.id, role="admin")
    db.add(member)
    db.commit()

    service = ItemService()

    # 1. Create Item
    item = service.create_item(
        db,
        space_id=space.id,
        current_user=user,
        category="wishlist",
        title="Totoro Plush",
        desc="Giant soft plush",
        tag="Birthday",
    )
    assert item.id is not None
    assert item.space_id == space.id
    assert item.title == "Totoro Plush"

    # 2. Get Items
    items = service.get_items(db, space_id=space.id, current_user=user)
    assert len(items) == 1
    assert items[0].id == item.id

    # 3. Update Item
    updated_item = service.update_item(
        db,
        space_id=space.id,
        item_id=item.id,
        current_user=user,
        title="Giant Totoro Plush",
        desc="Super soft plush",
    )
    assert updated_item.title == "Giant Totoro Plush"
    assert updated_item.desc == "Super soft plush"

    # 4. Delete Item
    service.delete_item(db, space_id=space.id, item_id=item.id, current_user=user)
    items_after_delete = service.get_items(db, space_id=space.id, current_user=user)
    assert len(items_after_delete) == 0


def test_shared_space_crud_and_cross_user_sync(db: Session):
    # Setup shared space with 2 members
    user_a = User(email="user_a@example.com", full_name="User A")
    user_b = User(email="user_b@example.com", full_name="User B")
    db.add_all([user_a, user_b])
    db.commit()

    shared_space = Space(name="Our Little Corner", type="shared")
    db.add(shared_space)
    db.commit()

    member_a = SpaceMember(space_id=shared_space.id, user_id=user_a.id, role="admin")
    member_b = SpaceMember(space_id=shared_space.id, user_id=user_b.id, role="member")
    db.add_all([member_a, member_b])
    db.commit()

    service = ItemService()

    # User A creates an item in the shared space
    item = service.create_item(
        db,
        space_id=shared_space.id,
        current_user=user_a,
        category="movies",
        title="My Neighbor Totoro",
    )

    # User B should be able to view it
    b_items = service.get_items(db, space_id=shared_space.id, current_user=user_b)
    assert len(b_items) == 1
    assert b_items[0].id == item.id
    assert b_items[0].title == "My Neighbor Totoro"

    # User B updates the item
    service.update_item(
        db,
        space_id=shared_space.id,
        item_id=item.id,
        current_user=user_b,
        title="Spirited Away",
    )

    # User A should see the update
    a_items = service.get_items(db, space_id=shared_space.id, current_user=user_a)
    assert len(a_items) == 1
    assert a_items[0].title == "Spirited Away"


def test_unauthorized_personal_space_access(db: Session):
    # Alice has her personal space
    alice = User(email="alice@example.com", full_name="Alice")
    bob = User(email="bob@example.com", full_name="Bob")
    db.add_all([alice, bob])
    db.commit()

    alice_space = Space(name="Alice's Space", type="personal")
    db.add(alice_space)
    db.commit()

    alice_member = SpaceMember(space_id=alice_space.id, user_id=alice.id, role="admin")
    db.add(alice_member)
    db.commit()

    service = ItemService()

    # Alice adds an item
    item = service.create_item(
        db,
        space_id=alice_space.id,
        current_user=alice,
        category="wishlist",
        title="Heart Necklace",
    )

    # Bob attempts to view Alice's items (raises NotSpaceMemberError)
    with pytest.raises(NotSpaceMemberError):
        service.get_items(db, space_id=alice_space.id, current_user=bob)

    # Bob attempts to modify Alice's items (raises NotSpaceMemberError)
    with pytest.raises(NotSpaceMemberError):
        service.update_item(
            db,
            space_id=alice_space.id,
            item_id=item.id,
            current_user=bob,
            title="Hacked Title",
        )

    # Bob attempts to delete Alice's items (raises NotSpaceMemberError)
    with pytest.raises(NotSpaceMemberError):
        service.delete_item(
            db, space_id=alice_space.id, item_id=item.id, current_user=bob
        )


def test_unauthorized_shared_space_access(db: Session):
    # Space shared by A and B. C is an outsider.
    user_a = User(email="a@example.com", full_name="User A")
    user_b = User(email="b@example.com", full_name="User B")
    user_c = User(email="c@example.com", full_name="User C")
    db.add_all([user_a, user_b, user_c])
    db.commit()

    shared_space = Space(name="Shared AB", type="shared")
    db.add(shared_space)
    db.commit()

    member_a = SpaceMember(space_id=shared_space.id, user_id=user_a.id, role="admin")
    member_b = SpaceMember(space_id=shared_space.id, user_id=user_b.id, role="member")
    db.add_all([member_a, member_b])
    db.commit()

    service = ItemService()

    # User C tries to create item in AB's space
    with pytest.raises(NotSpaceMemberError):
        service.create_item(
            db,
            space_id=shared_space.id,
            current_user=user_c,
            category="wishlist",
            title="Intruder Item",
        )


def test_item_not_found(db: Session):
    user = User(email="alice@example.com", full_name="Alice")
    db.add(user)
    db.commit()

    space = Space(name="Alice's Space", type="personal")
    db.add(space)
    db.commit()

    member = SpaceMember(space_id=space.id, user_id=user.id, role="admin")
    db.add(member)
    db.commit()

    service = ItemService()

    # Attempt to update a non-existent item id
    with pytest.raises(ItemNotFoundError):
        service.update_item(
            db,
            space_id=space.id,
            item_id="non-existent-id",
            current_user=user,
            title="New Title",
        )

    # Attempt to delete a non-existent item id
    with pytest.raises(ItemNotFoundError):
        service.delete_item(
            db, space_id=space.id, item_id="non-existent-id", current_user=user
        )
