import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "roboflow_configured" in data

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data

def test_predict_without_auth():
    # Si APP_API_KEY está configurada, debería fallar sin auth
    response = client.post("/api/v1/predict")
    # Puede ser 401 (no auth) o 422 (missing file)
    assert response.status_code in [401, 422]