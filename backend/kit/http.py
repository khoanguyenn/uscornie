"""HTTP utility helpers for extracting request details and metadata."""

from fastapi import Request


def get_ip_address(request: Request) -> str | None:
    """Extract the client's IP address from Cloudflare header, standard forwarding header, or direct host info.

    Args:
        request (Request): The incoming FastAPI / Starlette request object.

    Returns:
        str | None: The client's IP address if identified, or None.
    """
    cf_ip = request.headers.get("cf-connecting-ip")
    if cf_ip:
        return cf_ip

    x_forwarded_for = request.headers.get("x-forwarded-for")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()

    return request.client.host if request.client else None
