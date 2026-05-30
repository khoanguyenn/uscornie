from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship

from kit.database import Base, generate_uuid, utcnow


class SpaceMember(Base):
    __tablename__ = "space_members"
    id = Column(String, primary_key=True, default=generate_uuid)
    space_id = Column(String, ForeignKey("spaces.id"))
    user_id = Column(String, ForeignKey("users.id"))
    role = Column(String, default="member")  # admin, member
    joined_at = Column(DateTime, default=utcnow)

    space = relationship("Space", back_populates="members")
