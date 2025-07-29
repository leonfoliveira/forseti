import pytest
from auto_scaler.queue_monitor import QueueMonitor

class TestQueueMonitor:
    queue_name = "test_queue"
    queue_url = ""

    @pytest.fixture
    def sut(self, sqs_client):
        sqs_client.create_queue(QueueName=self.queue_name)
        self.queue_url = sqs_client.get_queue_url(QueueName=self.queue_name)["QueueUrl"]
        yield QueueMonitor(sqs_client, queue_name=self.queue_name)
        sqs_client.delete_queue(QueueUrl=self.queue_url)

    def test_get_number_of_messages(self, sut: QueueMonitor, sqs_client):
        assert sut.get_number_of_messages() == 0

        sqs_client.send_message(QueueUrl=self.queue_url, MessageBody="Test message")
        assert sut.get_number_of_messages() == 1

        messages = sqs_client.receive_message(QueueUrl=self.queue_url, MaxNumberOfMessages=1)
        if "Messages" in messages:
            receipt_handle = messages["Messages"][0]["ReceiptHandle"]
            sqs_client.delete_message(QueueUrl=self.queue_url, ReceiptHandle=receipt_handle)
        assert sut.get_number_of_messages() == 0