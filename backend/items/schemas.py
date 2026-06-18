"""Pydantic schemas validating item creation, updates, and structured API responses."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ItemBase(BaseModel):
    """Base schema defining common attributes of a saved item."""

    category: Literal[
        "wishlist", "food", "cafe", "books", "movies", "places", "habits", "other"
    ]
    title: str = Field(..., min_length=1, max_length=200)
    desc: str | None = Field(None, max_length=1000)
    tag: str | None = Field(None, max_length=50)

    @field_validator("title")
    @classmethod
    def validate_title_not_empty(cls, v: str) -> str:
        """Validate that the title is not empty or composed solely of whitespace.

        Args:
            v (str): The raw title string to validate.

        Returns:
            str: The stripped and validated title string.

        Raises:
            ValueError: If the title is empty or contains only whitespace.
        """
        if not v.strip():
            raise ValueError("Title must not be empty or consist only of whitespace.")
        return v.strip()


class ItemCreate(ItemBase):
    """Schema validating the request payload required to create a new item.

    Inherits all fields from ItemBase.
    """

    pass


class ItemUpdate(BaseModel):
    """Schema validating the request payload required to update an existing item."""

    title: str | None = Field(None, min_length=1, max_length=200)
    desc: str | None = Field(None, max_length=1000)
    tag: str | None = Field(None, max_length=50)

    @field_validator("title")
    @classmethod
    def validate_title_not_empty(cls, v: str | None) -> str | None:
        """Validate that the updated title, if provided, is not empty.

        Args:
            v (str | None): The title string to validate.

        Returns:
            str | None: The stripped and validated title, or None.

        Raises:
            ValueError: If the provided title is empty or contains only whitespace.
        """
        if v is not None:
            if not v.strip():
                raise ValueError(
                    "Title must not be empty or consist only of whitespace."
                )
            return v.strip()
        return v


class ItemResponse(ItemBase):
    """Schema structuring the response details of a saved item."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    space_id: str
    created_at: datetime
