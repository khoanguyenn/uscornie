from kit.exceptions import AppError


class CredentialsError(AppError):
    status_code: int = 401
    error_code: str = "UNAUTHORIZED"
    message: str = "Không thể xác thực thông tin đăng nhập."


class GoogleAuthError(AppError):
    status_code: int = 400
    error_code: str = "GOOGLE_AUTH_FAILED"
    message: str = "Xác thực tài khoản Google thất bại."
