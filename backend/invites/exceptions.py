from kit.exceptions import AppError


class InvalidInviteTokenError(AppError):
    status_code: int = 400
    error_code: str = "INVALID_INVITATION"
    message: str = "Liên kết mời không hợp lệ hoặc đã hết hạn."


class PersonalSpaceInviteError(AppError):
    status_code: int = 400
    error_code: str = "PERSONAL_SPACE_INVITE_FORBIDDEN"
    message: str = "Bạn không thể mời người khác vào không gian cá nhân."
