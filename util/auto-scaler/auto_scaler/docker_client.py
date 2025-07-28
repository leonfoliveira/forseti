import os
import docker


class DockerClient:
    def __init__(self):
        self.docker_client = docker.from_env()
        container_id = os.getenv("HOSTNAME")
        container = self.docker_client.containers.get(container_id)
        self.stack_name = container.labels.get("com.docker.stack.namespace")
