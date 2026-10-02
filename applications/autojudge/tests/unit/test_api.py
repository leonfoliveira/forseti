from unittest.mock import patch

import pytest

from autojudge import api


@pytest.fixture(scope="module")
def registered_app():
    if not any(r.rule == "/health" for r in api.app.url_map.iter_rules()):
        with patch.object(api.app, "run"):
            api.start_flask_app()
    return api.app


@pytest.fixture
def client(registered_app):
    with patch.object(api, "s3_client") as s3, patch.object(api, "sqs_client") as sqs:
        client = registered_app.test_client()
        client.s3, client.sqs = s3, sqs
        yield client


def test_health_ok(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.get_json() == {"status": "healthy"}
    client.sqs.get_queue_url.assert_called_once_with(
        QueueName="test-submission-queue"
    )


def test_health_unhealthy(client):
    client.s3.list_buckets.side_effect = Exception("down")

    response = client.get("/health")

    assert response.status_code == 503
    assert response.get_json() == {"status": "unhealthy"}


def test_metrics(client):
    response = client.get("/metrics")

    assert response.status_code == 200
    assert response.mimetype == "text/plain"
