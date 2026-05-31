from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ItemBase(BaseModel):
    category: str
    title: str
    desc: str | None = None
    tag: str | None = None


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    title: str | None = None
    desc: str | None = None
    tag: str | None = None


class ItemResponse(ItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    space_id: str
    created_at: datetime
