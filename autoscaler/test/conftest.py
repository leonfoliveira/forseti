import pytest

import docker


@pytest.fixture
def docker_client():
    yield docker.from_env()
