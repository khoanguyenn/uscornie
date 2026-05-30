from sqlalchemy.orm import Session

from models import User


class UserRepository:
    def get_by_id(self, db: Session, user_id: str) -> User | None:
        return db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, db: Session, email: str) -> User | None:
        return db.query(User).filter(User.email == email).first()

    def create(
        self,
        db: Session,
        email: str,
        full_name: str | None = None,
        picture: str | None = None,
    ) -> User:
        user = User(
            email=email,
            full_name=full_name,
            picture=picture,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
