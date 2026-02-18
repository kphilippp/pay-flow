import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch, MagicMock
import httpx

from main import app

client = TestClient(app)


def test_health_returns_200():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_metrics_endpoint_exists():
    response = client.get("/metrics")
    assert response.status_code == 200


def test_create_expense_empty_body_returns_error():
    # An empty dict body should propagate to the expense service.
    # We mock the httpx client to return a 400 Bad Request.
    mock_response = MagicMock()
    mock_response.status_code = 400
    mock_response.text = "Bad Request"

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock, return_value=mock_response):
        response = client.post("/expenses", json={})
        assert response.status_code == 400


def test_get_nonexistent_expense_returns_404():
    fake_id = "00000000-0000-0000-0000-000000000000"

    mock_response = MagicMock()
    mock_response.status_code = 404
    mock_response.json.return_value = {"error": "Expense not found"}

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock, return_value=mock_response):
        response = client.get(f"/expenses/{fake_id}")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
