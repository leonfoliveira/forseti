import pytest

from pika import BlockingConnection
from pika.adapters.blocking_connection import BlockingChannel

from autoscaler.queue_monitor import QueueMonitor

BASE_PATH = "judge-autoscaler.autoscaler.queue_monitor"


class TestQueueMonitor:
    queue_name = "test_queue"

    @pytest.fixture
    def channel(self, pika_client: BlockingConnection):
        yield pika_client.channel()

    @pytest.fixture
    def sut(self, pika_client: BlockingConnection, channel: BlockingChannel):
        channel.queue_declare(queue=self.queue_name)
        yield QueueMonitor(pika_client, queue_name=self.queue_name)

    def test_get_number_of_messages(self, sut: QueueMonitor, channel: BlockingChannel):
        assert sut.get_number_of_messages() == 0

        channel.basic_publish(
            exchange="",
            routing_key=self.queue_name,
            body="Test Message 1",
        )
        channel.basic_publish(
            exchange="",
            routing_key=self.queue_name,
            body="Test Message 2",
        )

        assert sut.get_number_of_messages() == 2
