from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ItemBase(BaseModel):
    category: Literal[
        "wishlist", "food", "cafe", "books", "movies", "places", "habits", "other"
    ]
    title: str = Field(..., min_length=1, max_length=200)
    desc: str | None = Field(None, max_length=1000)
    tag: str | None = Field(None, max_length=50)

    @field_validator("title")
    @classmethod
    def validate_title_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Title must not be empty or consist only of whitespace.")
        return v.strip()


class ItemCreate(ItemBase):
    pass


class ItemBulkCreate(BaseModel):
    items: list[ItemCreate] = Field(..., min_length=1, max_length=100)


class ItemUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    desc: str | None = Field(None, max_length=1000)
    tag: str | None = Field(None, max_length=50)

    @field_validator("title")
    @classmethod
    def validate_title_not_empty(cls, v: str | None) -> str | None:
        if v is not None:
            if not v.strip():
                raise ValueError(
                    "Title must not be empty or consist only of whitespace."
                )
            return v.strip()
        return v


class ItemResponse(ItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    space_id: str
    created_at: datetime
