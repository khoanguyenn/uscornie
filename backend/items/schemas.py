"""Module for schemas.py."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ItemBase(BaseModel):
    """ItemBase."""

    category: Literal[
        "wishlist", "food", "cafe", "books", "movies", "places", "habits", "other"
    ]
    title: str = Field(..., min_length=1, max_length=200)
    desc: str | None = Field(None, max_length=1000)
    tag: str | None = Field(None, max_length=50)

    @field_validator("title")
    @classmethod
    def validate_title_not_empty(cls, v: str) -> str:
        """validate_title_not_empty."""
        if not v.strip():
            raise ValueError("Title must not be empty or consist only of whitespace.")
        return v.strip()


class ItemCreate(ItemBase):
    """ItemCreate."""

    pass


class ItemUpdate(BaseModel):
    """ItemUpdate."""

    title: str | None = Field(None, min_length=1, max_length=200)
    desc: str | None = Field(None, max_length=1000)
    tag: str | None = Field(None, max_length=50)

    @field_validator("title")
    @classmethod
    def validate_title_not_empty(cls, v: str | None) -> str | None:
        """validate_title_not_empty."""
        if v is not None:
            if not v.strip():
                raise ValueError(
                    "Title must not be empty or consist only of whitespace."
                )
            return v.strip()
        return v


class ItemResponse(ItemBase):
    """ItemResponse."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    space_id: str
    created_at: datetime
