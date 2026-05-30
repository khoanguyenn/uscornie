from kit.exceptions import AppError


class CredentialsError(AppError):
    status_code: int = 401
    error_code: str = "UNAUTHORIZED"
    message: str = "Không thể xác thực thông tin đăng nhập."


class GoogleAuthError(AppError):
    status_code: int = 400
    error_code: str = "GOOGLE_AUTH_FAILED"
    message: str = "Xác thực tài khoản Google thất bại."


class SessionExpiredError(AppError):
    status_code: int = 401
    error_code: str = "SESSION_EXPIRED"
    message: str = "Phiên đăng nhập đã hết hạn."


class SessionInvalidError(AppError):
    status_code: int = 401
    error_code: str = "SESSION_INVALID"
    message: str = "Phiên đăng nhập không hợp lệ hoặc đã bị vô hiệu hóa."


class SessionReusedError(AppError):
    status_code: int = 401
    error_code: str = "SESSION_REUSED"
    message: str = "Cảnh báo bảo mật: Token đã được sử dụng từ trước."
