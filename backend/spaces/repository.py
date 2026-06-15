"""Module for repository.py."""

from sqlalchemy.orm import Session

from models import Space, SpaceMember


class SpaceRepository:
    """SpaceRepository."""

    def get_by_id(self, db: Session, space_id: str) -> Space | None:
        """get_by_id."""
        return db.query(Space).filter(Space.id == space_id).first()

    def create(self, db: Session, name: str, type: str) -> Space:
        """create."""
        space = Space(name=name, type=type)
        db.add(space)
        db.commit()
        db.refresh(space)
        return space

    def get_by_ids(self, db: Session, space_ids: list[str]) -> list[Space]:
        """get_by_ids."""
        return db.query(Space).filter(Space.id.in_(space_ids)).all()


class SpaceMemberRepository:
    """SpaceMemberRepository."""

    def get_member(
        self, db: Session, space_id: str, user_id: str
    ) -> SpaceMember | None:
        """get_member."""
        return (
            db.query(SpaceMember)
            .filter(SpaceMember.space_id == space_id, SpaceMember.user_id == user_id)
            .first()
        )

    def get_admin_shared_space_member(
        self, db: Session, user_id: str
    ) -> SpaceMember | None:
        """get_admin_shared_space_member."""
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
        """get_personal_space_member."""
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
        """get_memberships."""
        return db.query(SpaceMember).filter(SpaceMember.user_id == user_id).all()

    def get_any_member_role_membership(
        self, db: Session, user_id: str
    ) -> SpaceMember | None:
        """get_any_member_role_membership."""
        return (
            db.query(SpaceMember)
            .filter(SpaceMember.user_id == user_id, SpaceMember.role == "member")
            .first()
        )

    def count_members(self, db: Session, space_id: str) -> int:
        """count_members."""
        return db.query(SpaceMember).filter(SpaceMember.space_id == space_id).count()

    def is_in_shared_space(self, db: Session, user_id: str) -> bool:
        """is_in_shared_space."""
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
        """is_in_other_shared_space."""
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
        """create."""
        member = SpaceMember(space_id=space_id, user_id=user_id, role=role)
        db.add(member)
        db.commit()
        return member
