from auth.service import AuthService


def test_create_token_returns_encoded_jwt():
    service = AuthService()
    token = service.create_token("user-123")

    assert isinstance(token, str)
    assert token
