"""Data access layer managing database operations for spaces and memberships."""

from sqlalchemy.orm import Session

from models import Space, SpaceMember


class SpaceRepository:
    """Repository class coordinating database operations for Spaces."""

    def get_by_id(self, db: Session, space_id: str) -> Space | None:
        """Retrieve a specific space record by its unique ID.

        Args:
            db (Session): The database session.
            space_id (str): The unique ID of the space.

        Returns:
            Space | None: The matching Space object, or None if not found.
        """
        return db.query(Space).filter(Space.id == space_id).first()

    def create(self, db: Session, name: str, type: str) -> Space:
        """Create, persist, and return a new Space.

        Args:
            db (Session): The database session.
            name (str): The name of the space.
            type (str): The categorization of the space ("personal" or "shared").

        Returns:
            Space: The newly created Space object.
        """
        space = Space(name=name, type=type)
        db.add(space)
        db.commit()
        db.refresh(space)
        return space

    def get_by_ids(self, db: Session, space_ids: list[str]) -> list[Space]:
        """Retrieve multiple space records by their unique IDs.

        Args:
            db (Session): The database session.
            space_ids (list[str]): List of unique space IDs to query.

        Returns:
            list[Space]: A list of Space objects found.
        """
        return db.query(Space).filter(Space.id.in_(space_ids)).all()


class SpaceMemberRepository:
    """Repository class coordinating database operations for space memberships."""

    def get_member(
        self, db: Session, space_id: str, user_id: str
    ) -> SpaceMember | None:
        """Retrieve a specific membership record by space ID and user ID.

        Args:
            db (Session): The database session.
            space_id (str): The unique ID of the space.
            user_id (str): The unique ID of the user.

        Returns:
            SpaceMember | None: The matching SpaceMember record, or None if not found.
        """
        return (
            db.query(SpaceMember)
            .filter(SpaceMember.space_id == space_id, SpaceMember.user_id == user_id)
            .first()
        )

    def get_admin_shared_space_member(
        self, db: Session, user_id: str
    ) -> SpaceMember | None:
        """Retrieve the membership record where the user is an admin of a shared space.

        Args:
            db (Session): The database session.
            user_id (str): The unique ID of the user.

        Returns:
            SpaceMember | None: The matching SpaceMember record, or None if not found.
        """
        return (
            db.query(SpaceMember)
            .join(Space)
            .filter(
                SpaceMember.user_id == user_id,
                SpaceMember.role == "admin",
                Space.type == "shared",
            )
            .first()
        )

    def get_personal_space_member(
        self, db: Session, user_id: str
    ) -> SpaceMember | None:
        """Retrieve the membership record where the user belongs to their own personal space.

        Args:
            db (Session): The database session.
            user_id (str): The unique ID of the user.

        Returns:
            SpaceMember | None: The matching SpaceMember record, or None if not found.
        """
        return (
            db.query(SpaceMember)
            .join(Space)
            .filter(
                SpaceMember.user_id == user_id,
                Space.type == "personal",
            )
            .first()
        )

    def get_memberships(self, db: Session, user_id: str) -> list[SpaceMember]:
        """Retrieve all membership records associated with a specific user.

        Args:
            db (Session): The database session.
            user_id (str): The unique ID of the user.

        Returns:
            list[SpaceMember]: A list of SpaceMember records.
        """
        return db.query(SpaceMember).filter(SpaceMember.user_id == user_id).all()

    def get_any_member_role_membership(
        self, db: Session, user_id: str
    ) -> SpaceMember | None:
        """Retrieve any membership record where the user is a non-admin member of a shared space.

        Args:
            db (Session): The database session.
            user_id (str): The unique ID of the user.

        Returns:
            SpaceMember | None: The matching SpaceMember record, or None if not found.
        """
        return (
            db.query(SpaceMember)
            .filter(SpaceMember.user_id == user_id, SpaceMember.role == "member")
            .first()
        )

    def count_members(self, db: Session, space_id: str) -> int:
        """Count the total number of members currently in a specific space.

        Args:
            db (Session): The database session.
            space_id (str): The unique ID of the space.

        Returns:
            int: The total count of members in that space.
        """
        return db.query(SpaceMember).filter(SpaceMember.space_id == space_id).count()

    def is_in_shared_space(self, db: Session, user_id: str) -> bool:
        """Check if a user is a member of any shared space containing 2 or more members.

        Args:
            db (Session): The database session.
            user_id (str): The unique ID of the user.

        Returns:
            bool: True if the user belongs to any active shared space with >= 2 members.
        """
        shared_space_ids = (
            db.query(SpaceMember.space_id)
            .join(Space)
            .filter(SpaceMember.user_id == user_id, Space.type == "shared")
            .all()
        )
        for (sp_id,) in shared_space_ids:
            member_count = (
                db.query(SpaceMember).filter(SpaceMember.space_id == sp_id).count()
            )
            if member_count >= 2:
                return True
        return False

    def is_in_other_shared_space(
        self, db: Session, user_id: str, space_id: str
    ) -> bool:
        """Check if a user is a member of any shared space other than the one specified.

        Args:
            db (Session): The database session.
            user_id (str): The unique ID of the user.
            space_id (str): The ID of the space to exclude from the check.

        Returns:
            bool: True if the user is in any other shared space containing >= 2 members.
        """
        shared_space_ids = (
            db.query(SpaceMember.space_id)
            .join(Space)
            .filter(
                SpaceMember.user_id == user_id,
                Space.type == "shared",
                SpaceMember.space_id != space_id,
            )
            .all()
        )
        for (sp_id,) in shared_space_ids:
            member_count = (
                db.query(SpaceMember).filter(SpaceMember.space_id == sp_id).count()
            )
            if member_count >= 2:
                return True
        return False

    def create(
        self, db: Session, space_id: str, user_id: str, role: str
    ) -> SpaceMember:
        """Create, persist, and return a new space membership.

        Args:
            db (Session): The database session.
            space_id (str): The unique ID of the space.
            user_id (str): The unique ID of the user joining.
            role (str): The role of the user (e.g. "admin", "member").

        Returns:
            SpaceMember: The newly created SpaceMember record.
        """
        member = SpaceMember(space_id=space_id, user_id=user_id, role=role)
        db.add(member)
        db.commit()
        return member
