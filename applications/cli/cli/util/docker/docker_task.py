from cli.composition import get_docker_client


class DockerTask:
    def __init__(self, swarm, stack, service, docker_task):
        self.docker_client = get_docker_client()
        self.swarm = swarm
        self.stack = stack
        self.service = service
        self.docker_task = docker_task

    @property
    def node(self):
        node_id = self.docker_task.get("NodeID", "")
        return next((n for n in self.swarm.nodes if n.id == node_id), None)

    @property
    def state(self):
        return self.docker_task.get("Status", {}).get("State", "unknown")

    @property
    def is_running(self):
        return self.state == "running"

    @property
    def container_id(self):
        return (
            self.docker_task.get("Status", {})
            .get("ContainerStatus", {})
            .get("ContainerID", "")
        )
