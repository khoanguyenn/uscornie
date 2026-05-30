from sqlalchemy import Column, DateTime, String

from kit.database import Base, generate_uuid, utcnow


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    picture = Column(String)
    created_at = Column(DateTime, default=utcnow)
