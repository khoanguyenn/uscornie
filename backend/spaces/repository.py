from sqlalchemy.orm import Session

from models import Space, SpaceMember


class SpaceRepository:
    def get_by_id(self, db: Session, space_id: str) -> Space | None:
        return db.query(Space).filter(Space.id == space_id).first()

    def create(self, db: Session, name: str, type: str) -> Space:
        space = Space(name=name, type=type)
        db.add(space)
        db.commit()
        db.refresh(space)
        return space

    def get_by_ids(self, db: Session, space_ids: list[str]) -> list[Space]:
        return db.query(Space).filter(Space.id.in_(space_ids)).all()


class SpaceMemberRepository:
    def get_member(
        self, db: Session, space_id: str, user_id: str
    ) -> SpaceMember | None:
        return (
            db.query(SpaceMember)
            .filter(SpaceMember.space_id == space_id, SpaceMember.user_id == user_id)
            .first()
        )

    def get_admin_shared_space_member(
        self, db: Session, user_id: str
    ) -> SpaceMember | None:
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
        return db.query(SpaceMember).filter(SpaceMember.user_id == user_id).all()

    def get_any_member_role_membership(
        self, db: Session, user_id: str
    ) -> SpaceMember | None:
        return (
            db.query(SpaceMember)
            .filter(SpaceMember.user_id == user_id, SpaceMember.role == "member")
            .first()
        )

    def count_members(self, db: Session, space_id: str) -> int:
        return db.query(SpaceMember).filter(SpaceMember.space_id == space_id).count()

    def create(
        self, db: Session, space_id: str, user_id: str, role: str
    ) -> SpaceMember:
        member = SpaceMember(space_id=space_id, user_id=user_id, role=role)
        db.add(member)
        db.commit()
        return member
