from kit.exceptions import AppError


class ItemNotFoundError(AppError):
    status_code: int = 404
    error_code: str = "ITEM_NOT_FOUND"
    message: str = "Mục lưu trữ không tồn tại."
