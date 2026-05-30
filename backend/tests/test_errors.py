from fastapi.testclient import TestClient

from main import app


def test_validation_error_response_format():
    client = TestClient(app)
    # Gửi request thiếu trường `credential` bắt buộc lên /auth/google
    response = client.post("/auth/google", json={})

    assert response.status_code == 422
    data = response.json()

    assert data["success"] is False
    assert data["error_code"] == "VALIDATION_ERROR"
    assert "Dữ liệu đầu vào không hợp lệ" in data["message"]
    assert len(data["details"]) > 0
    assert data["details"][0]["loc"] == ["body", "credential"]


def test_http_exception_404_format():
    client = TestClient(app)
    # Truy cập một route không tồn tại
    response = client.get("/non-existent-route-12345")

    assert response.status_code == 404
    data = response.json()

    assert data["success"] is False
    assert data["error_code"] == "HTTP_404"
    assert "Not Found" in data["message"]


def test_auth_unauthorized_missing_token_format():
    client = TestClient(app)
    # Truy cập route được bảo vệ không có token -> Bị chặn bởi OAuth2PasswordBearer
    response = client.get("/spaces/me")

    assert response.status_code == 401
    data = response.json()

    assert data["success"] is False
    assert data["error_code"] == "HTTP_401"
    assert "Not authenticated" in data["message"]


def test_auth_unauthorized_invalid_token_format():
    client = TestClient(app)
    # Truy cập với token không hợp lệ -> Bị chặn bởi logic xác thực JWT (CredentialsError)
    response = client.get(
        "/spaces/me", headers={"Authorization": "Bearer invalid-token"}
    )

    assert response.status_code == 401
    data = response.json()

    assert data["success"] is False
    assert data["error_code"] == "UNAUTHORIZED"
    assert "Could not validate credentials" in data["message"]
