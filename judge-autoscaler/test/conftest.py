import pytest
from testcontainers.rabbitmq import RabbitMqContainer

import docker


@pytest.fixture
def docker_client():
    yield docker.from_env()
