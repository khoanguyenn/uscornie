import auth_utils


def test_create_token_returns_encoded_jwt():
    token = auth_utils.create_token("user-123")

    assert isinstance(token, str)
    assert token
