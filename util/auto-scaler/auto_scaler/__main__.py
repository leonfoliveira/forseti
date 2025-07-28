import logging
import os

from prometheus_client import start_http_server

from .aws_client import AwsClient
from .docker_client import DockerClient
from .queue_monitor import QueueMonitor
from .scaler import Scaler
from .service_monitor import ServiceMonitor


logging.basicConfig(
    level=logging.INFO,
    format="ts=%(asctime)s level=%(levelname)s logger=%(name)s msg=%(message)s",
)


aws_region = os.environ.get("AWS_REGION", "us-east-1")
aws_endpoint = os.environ.get("AWS_ENDPOINT", "http://localhost:4566")
aws_access_key_id = os.environ.get("AWS_ACCESS_KEY_ID", "test")
aws_secret_access_key = os.environ.get("AWS_SECRET_ACCESS_KEY", "test")
queue_name = os.environ.get("QUEUE_NAME", "submission-queue")
service_name = os.environ.get("SERVICE_NAME", "autojudge")

messages_per_replica = int(os.environ.get("MESSAGES_PER_REPLICA", 1))
min_replicas = int(os.environ.get("MIN_REPLICAS", 1))
max_replicas = int(os.environ.get("MAX_REPLICAS", 3))
cooldown = int(os.environ.get("COOLDOWN", 60))
interval = int(os.environ.get("INTERVAL", 10))

port = int(os.environ.get("PORT", 7000))


aws_client = AwsClient(
    aws_region=aws_region,
    aws_endpoint=aws_endpoint,
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key,
)
docker_client = DockerClient()

queue_monitor = QueueMonitor(
    aws_client=aws_client,
    queue_name=queue_name,
)
service_monitor = ServiceMonitor(
    docker_client=docker_client,
    service_name=service_name,
)

scaler = Scaler(
    queue_monitor=queue_monitor,
    service_monitor=service_monitor,
    interval=interval,
    cooldown=cooldown,
    messages_per_replica=messages_per_replica,
    min_replicas=min_replicas,
    max_replicas=max_replicas,
)

if __name__ == "__main__":
    start_http_server(port)
    logging.info("Starting auto-scaler")
    scaler.start()
