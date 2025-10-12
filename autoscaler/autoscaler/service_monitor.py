from docker import DockerClient


class ServiceMonitor:
    def __init__(self, docker_client: DockerClient, service_name: str):
        self.docker_client = docker_client
        self.service_name = service_name

    @property
    def service(self):
        return self.docker_client.services.get(self.service_name)

    def get_current_replicas(self) -> int:
        return self.service.attrs["Spec"]["Mode"]["Replicated"]["Replicas"]

    def scale(self, replicas) -> None:
        self.service.scale(replicas)
