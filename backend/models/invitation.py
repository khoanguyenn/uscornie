from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship

from kit.database import Base, generate_uuid, utcnow


class Invitation(Base):
    __tablename__ = "invitations"
    id = Column(String, primary_key=True, default=generate_uuid)
    token = Column(String, unique=True, index=True)
    space_id = Column(String, ForeignKey("spaces.id"))
    inviter_id = Column(String, ForeignKey("users.id"))
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)

    space = relationship("Space", back_populates="invitations")
