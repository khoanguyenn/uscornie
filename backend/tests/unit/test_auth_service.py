from auth.service import AuthService


def test_create_token_returns_encoded_jwt():
    service = AuthService()
    token = service.create_token("user-123")

    assert isinstance(token, str)
    assert token


def test_get_ip_address_fallbacks():
    from unittest.mock import MagicMock

    from fastapi import Request

    from kit.http import get_ip_address

    # Case 1: CF-Connecting-IP header exists
    req = MagicMock(spec=Request)
    req.headers = {"cf-connecting-ip": "1.1.1.1"}
    assert get_ip_address(req) == "1.1.1.1"

    # Case 2: X-Forwarded-For exists (taking first)
    req = MagicMock(spec=Request)
    req.headers = {"x-forwarded-for": "2.2.2.2, 3.3.3.3"}
    assert get_ip_address(req) == "2.2.2.2"

    # Case 3: Fallback to client host
    req = MagicMock(spec=Request)
    req.headers = {}
    req.client = MagicMock()
    req.client.host = "127.0.0.1"
    assert get_ip_address(req) == "127.0.0.1"

    # Case 4: No client or headers returns None
    req = MagicMock(spec=Request)
    req.headers = {}
    req.client = None
    assert get_ip_address(req) is None
