import logging

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


# Base exception for all application errors
class AppError(Exception):
    status_code: int = 400
    error_code: str = "BAD_REQUEST"
    message: str = "Đã xảy ra lỗi ứng dụng."
    headers: dict[str, str] | None = None

    def __init__(
        self, message: str | None = None, headers: dict[str, str] | None = None
    ):
        if message is not None:
            self.message = message
        if headers is not None:
            self.headers = headers
        super().__init__(self.message)


class ErrorDetail(BaseModel):
    loc: list[str] | None = None
    msg: str
    type: str


class ErrorResponse(BaseModel):
    success: bool = False
    error_code: str
    message: str
    details: list[ErrorDetail] | None = None


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_exception_handler(request: Request, exc: AppError):
        return JSONResponse(
            status_code=exc.status_code,
            headers=exc.headers,
            content=ErrorResponse(
                error_code=exc.error_code,
                message=exc.message,
            ).model_dump(),
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        headers = getattr(exc, "headers", None)
        return JSONResponse(
            status_code=exc.status_code,
            headers=headers,
            content=ErrorResponse(
                error_code=f"HTTP_{exc.status_code}",
                message=exc.detail,
            ).model_dump(),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ):
        details = [
            ErrorDetail(
                loc=[str(loc_val) for loc_val in err["loc"]],
                msg=err["msg"],
                type=err["type"],
            )
            for err in exc.errors()
        ]
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=ErrorResponse(
                error_code="VALIDATION_ERROR",
                message="Dữ liệu đầu vào không hợp lệ.",
                details=details,
            ).model_dump(),
        )

    @app.exception_handler(Exception)
    async def universal_exception_handler(request: Request, exc: Exception):
        logger.exception("An unexpected error occurred: %s", exc)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=ErrorResponse(
                error_code="INTERNAL_SERVER_ERROR",
                message="Đã có lỗi xảy ra từ phía máy chủ hệ thống. Vui lòng thử lại sau.",
            ).model_dump(),
        )
