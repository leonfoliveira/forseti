from docker import DockerClient

class ServiceMonitor:
    def __init__(self, docker_client: DockerClient, service_name: str):
        self.docker_client = docker_client
        self.service_name = service_name
        self.service = docker_client.services.get(service_name)

    def get_current_replicas(self) -> int:
        service = self.docker_client.services.get(self.service_name)
        return service.attrs["Spec"]["Mode"]["Replicated"]["Replicas"]

    def scale(self, replicas) -> None:
        service = self.docker_client.services.get(self.service_name)
        service.scale(replicas)
