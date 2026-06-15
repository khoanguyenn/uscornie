"""Data access layer managing database operations for user sessions."""

from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from models import User, UserSession


class UserRepository:
    """Data access layer class managing database query and mutation operations for Users."""

    def get_by_id(self, db: Session, user_id: str) -> User | None:
        """Retrieve a specific User record by its unique ID.

        Args:
            db (Session): The database session.
            user_id (str): The unique ID of the user.

        Returns:
            User | None: The matching User object if found, otherwise None.
        """
        return db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, db: Session, email: str) -> User | None:
        """Retrieve a specific User record by its email address.

        Args:
            db (Session): The database session.
            email (str): The email address to look up.

        Returns:
            User | None: The matching User object if found, otherwise None.
        """
        return db.query(User).filter(User.email == email).first()

    def create(
        self,
        db: Session,
        email: str,
        full_name: str | None = None,
        picture: str | None = None,
    ) -> User:
        """Create, persist, and return a new User record.

        Args:
            db (Session): The database session.
            email (str): The email address of the user.
            full_name (str | None, optional): The user's full name. Defaults to None.
            picture (str | None, optional): The user's profile picture URL. Defaults to None.

        Returns:
            User: The newly created User object.
        """
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
    """Repository class coordinating database operations for active and rotated user sessions."""

    def get_session_by_id(self, db: Session, session_id: str) -> UserSession | None:
        """Retrieve a specific session record by its unique session ID.

        Args:
            db (Session): The database session.
            session_id (str): The unique ID representing the session.

        Returns:
            UserSession | None: The matching UserSession object if found, otherwise None.
        """
        return db.query(UserSession).filter(UserSession.id == session_id).first()

    def get_active_sessions_by_user(
        self, db: Session, user_id: str
    ) -> list[UserSession]:
        """Retrieve all active and non-expired sessions belonging to a specific user.

        Args:
            db (Session): The database session.
            user_id (str): The unique ID of the user.

        Returns:
            list[UserSession]: A list of active, non-expired UserSession records.
        """
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
        device_info: dict,
        ip_address: str | None,
        expires_in_days: int = 30,
        parent_id: str | None = None,
    ) -> UserSession:
        """Create, persist, and return a new user session with expiration and optional parent tracking.

        Args:
            db (Session): The database session.
            user_id (str): The unique ID of the user.
            device_info (dict): Parsed browser and OS metadata.
            ip_address (str | None): The client's IP address.
            expires_in_days (int, optional): Expiration span of the session. Defaults to 30.
            parent_id (str | None, optional): Predecessor session ID if rotated. Defaults to None.

        Returns:
            UserSession: The newly created UserSession object.
        """
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
        """Check if a specific session ID has already been rotated (i.e. has a child session).

        Args:
            db (Session): The database session.
            session_id (str): The session ID to check.

        Returns:
            bool: True if there exists a session referencing this ID as its parent_id, else False.
        """
        return (
            db.query(UserSession).filter(UserSession.parent_id == session_id).first()
            is not None
        )

    def deactivate_session(self, db: Session, session_id: str) -> None:
        """Deactivate (invalidate) a specific session record by its ID.

        Args:
            db (Session): The database session.
            session_id (str): The unique session ID to deactivate.
        """
        session = self.get_session_by_id(db, session_id)
        if session:
            session.is_active = False
            db.commit()

    def deactivate_all_user_sessions(self, db: Session, user_id: str) -> None:
        """Deactivate all active sessions belonging to a specific user.

        Args:
            db (Session): The database session.
            user_id (str): The unique ID of the target user.
        """
        db.query(UserSession).filter(
            UserSession.user_id == user_id, UserSession.is_active
        ).update({"is_active": False}, synchronize_session=False)
        db.commit()

    def update_session_activity(
        self, db: Session, session_id: str, ip_address: str | None
    ) -> None:
        """Update the last active timestamp and IP address of an active session.

        Args:
            db (Session): The database session.
            session_id (str): The unique session ID to update.
            ip_address (str | None): The new client IP address.
        """
        session = self.get_session_by_id(db, session_id)
        if session:
            session.last_active_at = datetime.now(UTC)
            session.ip_address = ip_address
            db.commit()
