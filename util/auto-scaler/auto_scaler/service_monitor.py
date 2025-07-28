class ServiceMonitor:
    def __init__(self, docker_client, service_name):
        self.docker_client = docker_client
        self.service_name = service_name
        self.service = docker_client.services.get(service_name)

    def get_current_replicas(self):
        service = self.docker_client.services.get(self.service_name)
        return service.attrs["Spec"]["Mode"]["Replicated"]["Replicas"]

    def scale(self, replicas):
        service = self.docker_client.services.get(self.service_name)
        service.scale(replicas)
