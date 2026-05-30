from auth import service


def test_create_token_returns_encoded_jwt():
    token = service.create_token("user-123")

    assert isinstance(token, str)
    assert token
