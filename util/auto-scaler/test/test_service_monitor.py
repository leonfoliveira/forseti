import docker
import pytest
from auto_scaler.service_monitor import ServiceMonitor

class TestServiceMonitor:
    def _init_or_keep_swarm(self, docker_client):
        try:
            docker_client.swarm.init()
        except docker.errors.APIError:
            # Swarm already initialized, do nothing
            pass

    @pytest.fixture(scope="class")
    def sut(self, docker_client):
        self._init_or_keep_swarm(docker_client)
        service_name = "test_service_monitor"
        service = docker_client.services.create(
            image="nginx:latest",
            name=service_name,
            mode={"Replicated": {"Replicas": 0}},
        )
        yield ServiceMonitor(docker_client=docker_client, service_name=service_name)
        service.remove()

    def test_get_current_replicas(self, sut: ServiceMonitor):
        current_replicas = sut.get_current_replicas()
        assert isinstance(current_replicas, int)
        assert current_replicas >= 0

    def test_scale(self, sut: ServiceMonitor):
        initial_replicas = sut.get_current_replicas()
        new_replicas = initial_replicas + 1
        sut.scale(new_replicas)
        assert sut.get_current_replicas() == new_replicas