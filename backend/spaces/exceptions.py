"""Custom exceptions raised during space and membership management."""

from kit.exceptions import AppError


class SpaceAlreadyOwnedError(AppError):
    """Exception raised when a user attempts to create a shared space but already owns one as admin."""

    status_code: int = 400
    error_code: str = "SPACE_ALREADY_OWNED"
    message: str = "Bạn đã tạo một không gian chung rồi."


class NotSpaceMemberError(AppError):
    """Exception raised when a user attempts to access space resources without being a member."""

    status_code: int = 403
    error_code: str = "FORBIDDEN"
    message: str = "Bạn không phải thành viên của không gian này."


class AlreadyJoinedSpaceError(AppError):
    """Exception raised when a user attempts to join a shared space but is already a member of another shared space."""

    status_code: int = 400
    error_code: str = "ALREADY_JOINED_ANOTHER_SPACE"
    message: str = "Bạn đã tham gia một không gian khác rồi."


class SpaceFullError(AppError):
    """Exception raised when a user attempts to join a shared space that has reached its maximum member limit (2)."""

    status_code: int = 400
    error_code: str = "SPACE_FULL"
    message: str = "Không gian này đã đầy."
