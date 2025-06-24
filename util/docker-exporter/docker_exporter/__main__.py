from prometheus_client import start_http_server, Gauge
import docker
import logging
import os
import threading
import time

logging.basicConfig(level=logging.INFO)

port = int(os.environ.get("PORT", 7000))
interval = int(os.environ.get("INTERVAL", 10))

CONTAINER_STATUS = Gauge(
    "docker_container_status",
    "Status of Docker containers",
    ["container_id", "container_name", "image", "service"],
)
CONTAINER_CPU_LIMIT = Gauge(
    "docker_container_cpu_limit",
    "CPU limit of Docker containers",
    ["container_id", "container_name", "image", "service"],
)
CONTAINER_MEMORY_LIMIT = Gauge(
    "docker_container_memory_limit",
    "Memory limit of Docker containers",
    ["container_id", "container_name", "image", "service"],
)
CONTAINER_CPU_USAGE = Gauge(
    "docker_container_cpu_usage",
    "CPU usage of Docker containers",
    ["container_id", "container_name", "image", "service"],
)
CONTAINER_MEMORY_USAGE = Gauge(
    "docker_container_memory_usage",
    "Memory usage of Docker containers",
    ["container_id", "container_name", "image", "service"],
)

docker_client = docker.from_env()


def collect_container_metrics():
    containers = docker_client.containers.list()
    for container in containers:
        stats = container.stats(stream=False)
        labels = container.labels
        host_config = container.attrs.get("HostConfig", {})

        labels = {
            "container_id": container.id,
            "container_name": container.name,
            "image": container.image.tags[0] if container.image.tags else "none",
            "service": labels.get("com.docker.compose.service", "none"),
        }

        CONTAINER_STATUS.labels(
            **labels
        ).set(1 if container.status == "running" else 0)
        CONTAINER_CPU_LIMIT.labels(
            **labels).set(host_config["NanoCpus"])
        CONTAINER_MEMORY_LIMIT.labels(
            **labels).set(host_config["MemoryReservation"])
        CONTAINER_CPU_USAGE.labels(
            **labels).set(stats["cpu_stats"]["cpu_usage"]["total_usage"] - stats["precpu_stats"]["cpu_usage"]["total_usage"])
        CONTAINER_MEMORY_USAGE.labels(
            **labels).set(stats["memory_stats"]["usage"])


def collect_all():
    try:
        collect_container_metrics()
    except Exception as e:
        logging.error(f"Error collecting metrics: {e}")


if __name__ == "__main__":
    start_http_server(port)

    logging.info(f"Starting Docker Exporter")
    while True:
        threading.Thread(target=collect_all).start()
        time.sleep(interval)
