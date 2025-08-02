from unittest.mock import MagicMock

import pytest

from autoscaler.queue_monitor import QueueMonitor
from autoscaler.scaler import Scaler
from autoscaler.service_monitor import ServiceMonitor

BASE_PATH = "autoscaler.scaler"


class TestScaler:
    @pytest.fixture
    def queue_monitor(self):
        yield MagicMock(spec=QueueMonitor)

    @pytest.fixture
    def service_monitor(self):
        yield MagicMock(spec=ServiceMonitor, service_name="service_name")

    @pytest.fixture
    def sut(self, queue_monitor, service_monitor):
        return Scaler(
            queue_monitor=queue_monitor,
            service_monitor=service_monitor,
            cooldown=60,
            messages_per_replica=1,
            min_replicas=1,
            max_replicas=2
        )

    def test_less_than_min_replica(self, sut, queue_monitor, service_monitor):
        queue_monitor.get_number_of_messages.return_value = 0
        service_monitor.get_current_replicas.return_value = 0

        sut.scale()

        service_monitor.scale.assert_called_once_with(1)

    def test_less_than_desired_replicas_within_quota(self, sut, queue_monitor, service_monitor):
        queue_monitor.get_number_of_messages.return_value = 2
        service_monitor.get_current_replicas.return_value = 1

        sut.scale()

        service_monitor.scale.assert_called_once_with(2)

    def test_less_than_desired_replicas_exceeding_quota(self, sut, queue_monitor, service_monitor):
        queue_monitor.get_number_of_messages.return_value = 3
        service_monitor.get_current_replicas.return_value = 1

        sut.scale()

        service_monitor.scale.assert_called_once_with(2)

    def test_equal_as_desired_replicas(self, sut, queue_monitor, service_monitor):
        queue_monitor.get_number_of_messages.return_value = 2
        service_monitor.get_current_replicas.return_value = 2

        sut.scale()

        service_monitor.scale.assert_not_called()

    def test_more_than_max_replicas(self, sut, queue_monitor, service_monitor):
        queue_monitor.get_number_of_messages.return_value = 3
        service_monitor.get_current_replicas.return_value = 3

        sut.scale()

        service_monitor.scale.assert_called_once_with(2)

    def test_more_than_desired_replicas_within_quota(self, sut, queue_monitor, service_monitor):
        queue_monitor.get_number_of_messages.return_value = 1
        service_monitor.get_current_replicas.return_value = 2

        sut.scale()

        service_monitor.scale.assert_called_once_with(1)

    def test_more_than_desired_replicas_exceeding_quota(self, sut, queue_monitor, service_monitor):
        queue_monitor.get_number_of_messages.return_value = 0
        service_monitor.get_current_replicas.return_value = 2

        sut.scale()

        service_monitor.scale.assert_called_once_with(1)

    def test_cooling_down(self, sut, queue_monitor, service_monitor):
        queue_monitor.get_number_of_messages.return_value = 2
        service_monitor.get_current_replicas.return_value = 1

        sut.scale()
        assert service_monitor.scale.call_count == 1

        queue_monitor.get_number_of_messages.return_value = 1
        service_monitor.get_current_replicas.return_value = 2

        sut.scale()
        assert service_monitor.scale.call_count == 1
