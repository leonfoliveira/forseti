import docker

from .collector import Collector
from .metrics import (
    DOCKER_CPU_USAGE,
    DOCKER_MEMORY_USAGE,
    DOCKER_UP,
)


class DockerCollector(Collector):
    def __init__(self):
        super().__init__()
        self.docker_client = docker.from_env()
        self.containers = [
            "judge-postgres",
            "judge-localstack",
            "judge-loki",
            "judge-grafana",
            "judge-api",
            "judge-worker",
            "judge-webapp",
        ]

    def _collect(self):
        for container_name in self.containers:
            container = self.docker_client.containers.get(container_name)
            DOCKER_UP.labels(container_name=container_name).set(
                1 if container.status == 'running' else 0)
            if container.status != 'running':
                return

            stats = container.stats(stream=False)

            cpu_usage = stats["cpu_stats"]["cpu_usage"]["total_usage"]
            system_cpu_usage = stats["cpu_stats"]["system_cpu_usage"]

            precpu_usage = stats["precpu_stats"]["cpu_usage"]["total_usage"]
            presystem_cpu_usage = stats["precpu_stats"]["system_cpu_usage"]

            cpu_percent = 0.0
            if presystem_cpu_usage > 0 and system_cpu_usage > presystem_cpu_usage:
                cpu_delta = cpu_usage - precpu_usage
                system_cpu_delta = system_cpu_usage - presystem_cpu_usage
                num_cpus = stats['cpu_stats']['online_cpus']
                cpu_percent = (cpu_delta / system_cpu_delta) * num_cpus * 100.0

            memory_usage = stats["memory_stats"]["usage"]
            memory_limit = stats["memory_stats"]["limit"]

            memory_percent = (memory_usage / memory_limit) * 100.0

            DOCKER_CPU_USAGE.labels(
                container_name=container_name).set(cpu_percent)
            DOCKER_MEMORY_USAGE.labels(
                container_name=container_name).set(memory_percent)
