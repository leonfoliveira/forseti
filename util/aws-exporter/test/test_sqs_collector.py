import pytest
from prometheus_client import generate_latest

from aws_exporter.sqs_collector import SqsCollector


class TestSqsCollector:
    @pytest.fixture
    def sut(self, sqs_client):
        yield SqsCollector(sqs_client)

    def test_collect(self, sut, sqs_client):
        queue_name = "test-queue"
        queue_url = sqs_client.create_queue(QueueName=queue_name)["QueueUrl"]

        sqs_client.send_message(QueueUrl=queue_url, MessageBody="Message 1")
        sqs_client.send_message(QueueUrl=queue_url, MessageBody="Message 2")

        sut.collect()

        metrics = generate_latest()

        assert f'aws_sqs_approximate_number_of_messages{{queue_name="{queue_name}"}} 2.0' in metrics.decode('utf-8')
        assert f'aws_sqs_approximate_number_of_messages_not_visible{{queue_name="{queue_name}"}} 0.0' in metrics.decode('utf-8')
        assert f'aws_sqs_approximate_number_of_messages_delayed{{queue_name="{queue_name}"}} 0.0' in metrics.decode('utf-8')

    def test_collect_error(self, sut, sqs_client):
        sqs_client.list_queues = lambda: {"QueueUrls": ["invalid-queue-url"]}

        sut.collect()

        metrics = generate_latest()

        assert 'aws_exporter_sqs_fail_count 1.0' in metrics.decode('utf-8')