from unittest.mock import patch
import urllib
import pytest

from autoscaler.queue_monitor import QueueMonitor

BASE_PATH = "autoscaler.queue_monitor"


class TestQueueMonitor:
    queue_name = "test_queue"
    host = "localhost"
    port = 15672
    vhost = "/"
    username = "guest"
    password = "guest"

    @pytest.fixture(autouse=True)
    def requests(self):
        with patch(f"{BASE_PATH}.requests") as mock_requests:
            yield mock_requests

    @pytest.fixture
    def sut(self):
        yield QueueMonitor(queue_name=self.queue_name, host=self.host, port=self.port, vhost=self.vhost, username=self.username, password=self.password)

    def test_get_number_of_messages(self, sut: QueueMonitor, requests):
        requests.get.return_value.status_code = 200
        requests.get.return_value.json.return_value = {
            "messages": 5,
        }

        assert sut.get_number_of_messages() == 5
        assert requests.get.call_count == 1
        requests.get.assert_called_with(
            f"http://{self.host}:{self.port}/api/queues/{urllib.parse.quote(self.vhost, safe='')}/{self.queue_name}",
            auth=(self.username, self.password),
        )
