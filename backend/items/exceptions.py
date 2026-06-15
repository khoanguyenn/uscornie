"""Custom exceptions raised during item management."""

from kit.exceptions import AppError


class ItemNotFoundError(AppError):
    """Exception raised when an item does not exist or cannot be found in the specified space."""

    status_code: int = 404
    error_code: str = "ITEM_NOT_FOUND"
    message: str = "Mục lưu trữ không tồn tại."
