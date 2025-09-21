import logging
import os
import signal
import threading
import time

import docker
import pika

from autoscaler.api import start_flask_app
from autoscaler.queue_monitor import QueueMonitor
from autoscaler.scaler import Scaler
from autoscaler.service_monitor import ServiceMonitor

logging.basicConfig(
    level=logging.INFO,
    format="ts=%(asctime)s level=%(levelname)s logger=%(name)s msg=%(message)s",
)


rabbitmq_host = os.environ["RABBITMQ_HOST"]
rabbitmq_port = os.environ["RABBITMQ_PORT"]
rabbitmq_username = os.environ["RABBITMQ_USER"]
rabbitmq_password = os.environ["RABBITMQ_PASSWORD"]
rabbitmq_vhost = os.environ["RABBITMQ_VHOST"]

queue_name = os.environ["QUEUE_NAME"]
service_name = os.environ["SERVICE_NAME"]

messages_per_replica = int(os.environ.get("MESSAGES_PER_REPLICA", 1))
min_replicas = int(os.environ.get("MIN_REPLICAS", 1))
max_replicas = int(os.environ.get("MAX_REPLICAS", 3))
cooldown = int(os.environ.get("COOLDOWN", 60))
interval = int(os.environ.get("INTERVAL", 10))

port = int(os.environ.get("PORT", 7000))


pika_client = pika.BlockingConnection(
    pika.ConnectionParameters(
        host=rabbitmq_host,
        port=int(rabbitmq_port),
        virtual_host=rabbitmq_vhost,
        credentials=pika.PlainCredentials(
            username=rabbitmq_username,
            password=rabbitmq_password,
        ),
    )
)
docker_client = docker.from_env()


queue_monitor = QueueMonitor(
    pika_client=pika_client,
    queue_name=queue_name,
)
service_monitor = ServiceMonitor(
    docker_client=docker_client,
    service_name=service_name,
)

scaler = Scaler(
    queue_monitor=queue_monitor,
    service_monitor=service_monitor,
    cooldown=cooldown,
    messages_per_replica=messages_per_replica,
    min_replicas=min_replicas,
    max_replicas=max_replicas,
)

is_active = True


def sigterm(signum, frame):
    global is_active
    logging.info("Received SIGTERM, shutting down gracefully...")
    is_active = False


signal.signal(signal.SIGTERM, sigterm)

if __name__ == "__main__":
    logging.info("Starting auto-scaler")

    server_thread = threading.Thread(
        target=start_flask_app, args=[queue_monitor, service_monitor, port], daemon=True
    )
    server_thread.start()

    while is_active:
        threading.Thread(target=scaler.scale).start()
        time.sleep(interval)

    logging.info("Auto-scaler stopped")
