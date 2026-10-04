from unittest.mock import patch

import pytest

from autojudge import api

pytestmark = pytest.mark.usefixtures("patch_aws")


@pytest.fixture
def client():
    if not any(r.rule == "/health" for r in api.app.url_map.iter_rules()):
        with patch.object(api.app, "run"):
            api.start_flask_app()
    return api.app.test_client()


def test_health_check_against_aws(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.get_json() == {"status": "healthy"}
