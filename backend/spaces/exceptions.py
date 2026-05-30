from kit.exceptions import AppError


class SpaceAlreadyOwnedError(AppError):
    status_code: int = 400
    error_code: str = "SPACE_ALREADY_OWNED"
    message: str = "Bạn đã tạo một không gian chung rồi."


class NotSpaceMemberError(AppError):
    status_code: int = 403
    error_code: str = "FORBIDDEN"
    message: str = "Bạn không phải thành viên của không gian này."


class AlreadyJoinedSpaceError(AppError):
    status_code: int = 400
    error_code: str = "ALREADY_JOINED_ANOTHER_SPACE"
    message: str = "Bạn đã tham gia một không gian khác rồi."


class SpaceFullError(AppError):
    status_code: int = 400
    error_code: str = "SPACE_FULL"
    message: str = "Không gian này đã đầy."
