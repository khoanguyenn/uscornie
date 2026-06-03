from kit.exceptions import AppError


class InvalidInviteTokenError(AppError):
    status_code: int = 400
    error_code: str = "INVALID_INVITATION"
    message: str = "Liên kết mời không hợp lệ hoặc đã hết hạn."


class PersonalSpaceInviteError(AppError):
    status_code: int = 400
    error_code: str = "PERSONAL_SPACE_INVITE_FORBIDDEN"
    message: str = "Bạn không thể mời người khác vào không gian cá nhân."


class InviteRateLimitExceededError(AppError):
    status_code: int = 429
    error_code: str = "INVITE_RATE_LIMIT_EXCEEDED"
    message: str = "Bạn đã tạo quá nhiều lời mời liên tục. Vui lòng thử lại sau 1 giờ."


class InvitationNotPendingError(AppError):
    status_code: int = 400
    error_code: str = "INVITATION_NOT_PENDING"
    message: str = "Lời mời không ở trạng thái chờ."


class InvitationPermissionDeniedError(AppError):
    status_code: int = 403
    error_code: str = "INVITATION_PERMISSION_DENIED"
    message: str = "Bạn không có quyền thao tác trên lời mời này."
