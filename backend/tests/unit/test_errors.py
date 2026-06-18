from fastapi.testclient import TestClient

from main import app


def test_validation_error_response_format():
    """
    Verify validation error response format flow.
    Action: Send request missing required `credential` body field to /auth/google
    """
    client = TestClient(app)
    # Send request missing required `credential` body field to /auth/google
    response = client.post("/auth/google", json={})

    assert response.status_code == 422
    data = response.json()

    assert data["success"] is False
    assert data["error_code"] == "VALIDATION_ERROR"
    assert "Dữ liệu đầu vào không hợp lệ" in data["message"]
    assert len(data["details"]) > 0
    assert data["details"][0]["loc"] == ["body", "credential"]


def test_http_exception_404_format():
    """
    Verify http exception 404 format flow.
    Execute standard test flow for test_http_exception_404_format.
    """
    client = TestClient(app)
    # Request a non-existent route
    response = client.get("/non-existent-route-12345")

    assert response.status_code == 404
    data = response.json()

    assert data["success"] is False
    assert data["error_code"] == "HTTP_404"
    assert "Not Found" in data["message"]


def test_auth_unauthorized_missing_token_format():
    """
    Verify auth unauthorized missing token format flow.
    Execute standard test flow for test_auth_unauthorized_missing_token_format.
    """
    client = TestClient(app)
    # Request protected route without token -> Blocked by OAuth2PasswordBearer
    response = client.get("/spaces/me")

    assert response.status_code == 401
    data = response.json()

    assert data["success"] is False
    assert data["error_code"] == "HTTP_401"
    assert "Not authenticated" in data["message"]


def test_auth_unauthorized_invalid_token_format():
    """
    Verify auth unauthorized invalid token format flow.
    Execute standard test flow for test_auth_unauthorized_invalid_token_format.
    """
    client = TestClient(app)
    # Request with invalid token -> Blocked by JWT auth logic (CredentialsError)
    response = client.get(
        "/spaces/me", headers={"Authorization": "Bearer invalid-token"}
    )

    assert response.status_code == 401
    data = response.json()

    assert data["success"] is False
    assert data["error_code"] == "UNAUTHORIZED"
    assert "Could not validate credentials" in data["message"]
