"""Module for database.py."""

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


def generate_uuid():
    """generate_uuid."""
    return str(uuid.uuid4())


def utcnow():
    """utcnow."""
    return datetime.datetime.now(datetime.UTC)


def get_db():
    """get_db."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
