import logging
import os
import signal
import threading
import time

import docker
from dotenv import load_dotenv

from autoscaler.api import start_flask_app
from autoscaler.queue_monitor import QueueMonitor
from autoscaler.scaler import Scaler
from autoscaler.service_monitor import ServiceMonitor

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="ts=%(asctime)s level=%(levelname)s logger=%(name)s msg=%(message)s",
)


rabbitmq_host = os.getenv("RABBITMQ_HOST")
rabbitmq_port = os.getenv("RABBITMQ_PORT")
rabbitmq_username = os.getenv("RABBITMQ_USER")
rabbitmq_password = os.getenv("RABBITMQ_PASSWORD")
rabbitmq_vhost = os.getenv("RABBITMQ_VHOST")

queue_name = os.getenv("QUEUE_NAME")
service_name = os.getenv("SERVICE_NAME")

messages_per_replica = int(os.getenv("MESSAGES_PER_REPLICA", 1))
min_replicas = int(os.getenv("MIN_REPLICAS", 1))
max_replicas = int(os.getenv("MAX_REPLICAS", 3))
cooldown = int(os.getenv("COOLDOWN", 60))
interval = int(os.getenv("INTERVAL", 10))

port = int(os.environ.get("PORT", 7000))


docker_client = docker.from_env()


queue_monitor = QueueMonitor(
    queue_name=queue_name,
    host=rabbitmq_host,
    port=int(rabbitmq_port),
    vhost=rabbitmq_vhost,
    username=rabbitmq_username,
    password=rabbitmq_password,
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
