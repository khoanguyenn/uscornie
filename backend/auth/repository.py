from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from models import User, UserSession


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


class SessionRepository:
    def get_session_by_id(self, db: Session, session_id: str) -> UserSession | None:
        return db.query(UserSession).filter(UserSession.id == session_id).first()

    def get_active_sessions_by_user(
        self, db: Session, user_id: str
    ) -> list[UserSession]:
        return (
            db.query(UserSession)
            .filter(
                UserSession.user_id == user_id,
                UserSession.is_active,
                UserSession.expires_at > datetime.now(UTC),
            )
            .all()
        )

    def create_session(
        self,
        db: Session,
        user_id: str,
        device_info: str,
        ip_address: str,
        expires_in_days: int = 30,
        parent_id: str | None = None,
    ) -> UserSession:
        expires_at = datetime.now(UTC) + timedelta(days=expires_in_days)
        session = UserSession(
            user_id=user_id,
            device_info=device_info,
            ip_address=ip_address,
            expires_at=expires_at,
            parent_id=parent_id,
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    def is_session_rotated(self, db: Session, session_id: str) -> bool:
        return (
            db.query(UserSession).filter(UserSession.parent_id == session_id).first()
            is not None
        )

    def deactivate_session(self, db: Session, session_id: str) -> None:

        session = self.get_session_by_id(db, session_id)
        if session:
            session.is_active = False
            db.commit()

    def deactivate_all_user_sessions(self, db: Session, user_id: str) -> None:
        db.query(UserSession).filter(
            UserSession.user_id == user_id, UserSession.is_active
        ).update({"is_active": False}, synchronize_session=False)
        db.commit()

    def update_session_activity(
        self, db: Session, session_id: str, ip_address: str
    ) -> None:
        session = self.get_session_by_id(db, session_id)
        if session:
            session.last_active_at = datetime.now(UTC)
            session.ip_address = ip_address
            db.commit()
