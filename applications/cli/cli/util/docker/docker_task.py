from docker.errors import APIError, NotFound

from cli.composition import get_docker_client


class DockerTask:
    def __init__(self, swarm, stack, service, docker_task):
        self.docker_client = get_docker_client()
        self.swarm = swarm
        self.stack = stack
        self.service = service
        self.docker_task = docker_task

        container_id = (
            self.docker_task.get("Status", {})
            .get("ContainerStatus", {})
            .get("ContainerID")
        )
        self.container = self._get_container(container_id)

        node_id = self.docker_task.get("NodeID", "")
        self.node = next((n for n in self.swarm.nodes if n.id == node_id), None)

    @property
    def state(self):
        return self.docker_task.get("Status", {}).get("State", "unknown")

    @property
    def has_health_check(self):
        if not self.container:
            return False
        return "Health" in self.container.attrs.get("State", {})

    @property
    def health_status(self):
        if not self.container:
            return None
        health = self.container.attrs.get("State", {}).get("Health")
        if health is None:
            return None
        return health.get("Status", "unknown")

    @property
    def is_running(self):
        return self.state == "running"

    @property
    def is_healthy(self):
        if not self.is_running:
            return False
        if not self.has_health_check:
            return True
        return self.health_status == "healthy"

    @property
    def container_id(self):
        if self.container and self.container.id:
            return self.container.id[:12]
        return ""

    def _get_container(self, container_id):
        if not container_id:
            return None
        try:
            return self.docker_client.containers.get(container_id)
        except (NotFound, APIError):
            return None
