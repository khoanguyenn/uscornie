"""Custom API exceptions raised during authentication and session validation."""

from kit.exceptions import AppError


class CredentialsError(AppError):
    """Exception raised when JWT access token signature, structure, or claims validation fails."""

    status_code: int = 401
    error_code: str = "UNAUTHORIZED"
    message: str = "Không thể xác thực thông tin đăng nhập."


class GoogleAuthError(AppError):
    """Exception raised when ID token verification against Google OAuth endpoints fails."""

    status_code: int = 400
    error_code: str = "GOOGLE_AUTH_FAILED"
    message: str = "Xác thực tài khoản Google thất bại."


class SessionExpiredError(AppError):
    """Exception raised when a session refresh token has expired."""

    status_code: int = 401
    error_code: str = "SESSION_EXPIRED"
    message: str = "Phiên đăng nhập đã hết hạn."


class SessionInvalidError(AppError):
    """Exception raised when a session refresh token cannot be found or has been explicitly deactivated."""

    status_code: int = 401
    error_code: str = "SESSION_INVALID"
    message: str = "Phiên đăng nhập không hợp lệ hoặc đã bị vô hiệu hóa."


class SessionReusedError(AppError):
    """Exception raised when a rotated session refresh token is reused, indicating a potential replay attack."""

    status_code: int = 401
    error_code: str = "SESSION_REUSED"
    message: str = "Cảnh báo bảo mật: Token đã được sử dụng từ trước."
