import datetime
import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship

from database import Base


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    picture = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Space(Base):
    __tablename__ = "spaces"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, default="Our Space")
    type = Column(String, default="personal")  # "personal" or "shared"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    members = relationship("SpaceMember", back_populates="space")
    invitations = relationship("Invitation", back_populates="space")


class SpaceMember(Base):
    __tablename__ = "space_members"
    id = Column(String, primary_key=True, default=generate_uuid)
    space_id = Column(String, ForeignKey("spaces.id"))
    user_id = Column(String, ForeignKey("users.id"))
    role = Column(String, default="member")  # admin, member
    joined_at = Column(DateTime, default=datetime.datetime.utcnow)

    space = relationship("Space", back_populates="members")


class Invitation(Base):
    __tablename__ = "invitations"
    id = Column(String, primary_key=True, default=generate_uuid)
    token = Column(String, unique=True, index=True)
    space_id = Column(String, ForeignKey("spaces.id"))
    inviter_id = Column(String, ForeignKey("users.id"))
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    space = relationship("Space", back_populates="invitations")
