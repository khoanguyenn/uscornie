from sqlalchemy import Column, DateTime, String
from sqlalchemy.orm import relationship

from kit.database import Base, generate_uuid, utcnow


class Space(Base):
    __tablename__ = "spaces"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, default="Our Space")
    type = Column(String, default="personal")  # "personal" or "shared"
    created_at = Column(DateTime, default=utcnow)

    members = relationship("SpaceMember", back_populates="space")
    invitations = relationship("Invitation", back_populates="space")
