import docker
import pytest

@pytest.fixture(scope="class")
def docker_client():
    yield docker.from_env()