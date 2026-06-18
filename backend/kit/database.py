"""Database engine initialization and session dependencies."""

import datetime
import os
import uuid

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:postgres@db:5432/uscornie"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def generate_uuid() -> str:
    """Generate a standard version 4 universally unique identifier (UUID) as a string.

    Returns:
        str: A randomly generated UUID string.
    """
    return str(uuid.uuid4())


def utcnow() -> datetime.datetime:
    """Get the current datetime object localized to the UTC timezone.

    Returns:
        datetime.datetime: The current date and time with UTC timezone info.
    """
    return datetime.datetime.now(datetime.UTC)


def get_db():
    """Yield a transactional database session and ensure it is closed after execution.

    This dependency function creates a new SQLAlchemy LocalSession, yields it to the
    caller (typically a FastAPI route/dependency), and guarantees its closure
    in a finally block when the request lifecycle ends.

    Yields:
        Iterator[Session]: A local SQLAlchemy database session instance.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
