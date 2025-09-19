import pytest
from testcontainers.rabbitmq import RabbitMqContainer

import docker
import pika


@pytest.fixture
def docker_client():
    yield docker.from_env()


@pytest.fixture
def pika_client():
    with RabbitMqContainer(image="rabbitmq:4.1.4-management-alpine") as rabbitmq:
        yield pika.BlockingConnection(rabbitmq.get_connection_params())
