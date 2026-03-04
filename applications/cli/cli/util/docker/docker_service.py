from docker.errors import APIError, NotFound

from .docker_task import DockerTask


class DockerService:
    def __init__(self, swarm, stack, name: str, config: dict, docker_service):
        self.swarm = swarm
        self.stack = stack
        self.name = name
        self.config = config
        self.docker_service = docker_service

    @property
    def is_running(self):
        return self.running_replicas > 0

    @property
    def is_converged(self):
        running_tasks = [task for task in self.tasks if task.is_running]
        if len(running_tasks) != self.desired_replicas:
            return False
        return all(task.is_healthy for task in running_tasks)

    @property
    def mode(self):
        if not self.docker_service:
            return "unknown"
        spec = self.docker_service.attrs.get("Spec", {})
        mode = spec.get("Mode", {})
        if "Replicated" in mode:
            return "replicated"
        elif "Global" in mode:
            return "global"
        return "unknown"

    @property
    def desired_replicas(self):
        if self.mode == "replicated":
            return (
                self.docker_service.attrs.get("Spec", {})
                .get("Mode", {})
                .get("Replicated", {})
                .get("Replicas", 0)
            )
        elif self.mode == "global":
            return len(self.swarm.nodes)
        return 0

    @property
    def running_replicas(self):
        if not self.docker_service:
            return 0
        try:
            tasks = self.docker_service.tasks()
            running_tasks = [
                task
                for task in tasks
                if task.get("Status", {}).get("State") == "running"
            ]
            return len(running_tasks)
        except (NotFound, APIError):
            return 0

    @property
    def tasks(self):
        if not self.docker_service:
            return []
        try:
            active_states = {
                "new",
                "pending",
                "assigned",
                "accepted",
                "preparing",
                "starting",
                "running",
            }
            return [
                DockerTask(self.swarm, self.stack, self, task)
                for task in self.docker_service.tasks()
                if task.get("Status", {}).get("State") in active_states
            ]
        except (NotFound, APIError):
            return []

    def scale(self, replicas: int):
        if not self.docker_service:
            raise ValueError(f"Service '{self.name}' is not deployed")
        self.docker_service.scale(replicas)
        self.docker_service.reload()

    def force_update(self):
        if not self.docker_service:
            raise ValueError(f"Service '{self.name}' is not deployed")
        version = self.docker_service.attrs.get("Version", {}).get("Index", 0)
        force_update = (
            self.docker_service.attrs.get("Spec", {})
            .get("TaskTemplate", {})
            .get("ForceUpdate", 0)
        )
        self.docker_service.update(
            version=version,
            force_update=force_update + 1,
        )
        self.docker_service.reload()
