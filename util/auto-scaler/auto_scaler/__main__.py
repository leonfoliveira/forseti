from prometheus_client import start_http_server, Gauge
import boto3
import docker
import logging
import os
import threading
import time

logging.basicConfig(level=logging.INFO)


aws_region = os.environ.get("AWS_REGION", "us-east-1")
aws_endpoint = os.environ.get("AWS_ENDPOINT", "http://localhost:4566")
aws_access_key_id = os.environ.get("AWS_ACCESS_KEY_ID", "test")
aws_secret_access_key = os.environ.get("AWS_SECRET_ACCESS_KEY", "test")
queue_name = os.environ.get("QUEUE_NAME", "submission-queue")
service_name = os.environ.get("SERVICE_NAME", "worker")

messages_per_replica = os.environ.get("MESSAGES_PER_REPLICA", 1)
min_replicas = os.environ.get("MIN_REPLICAS", 1)
max_replicas = os.environ.get("MAX_REPLICAS", 3)
cooldown = int(os.environ.get("COOLDOWN", 60))
interval = int(os.environ.get("INTERVAL", 10))

port = int(os.environ.get("PORT", 7000))


CURRENT_REPLICAS = Gauge("auto_scaler_current_replicas")
DESIRED_REPLICAS = Gauge("auto_scaler_desired_replicas")


sqs_client = boto3.client(
    "sqs",
    region_name=aws_region,
    endpoint_url=aws_endpoint,
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key,
)
docker_client = docker.from_env()


last_scale_time = None


def scale():
    try:
        response = sqs_client.get_queue_url(QueueName=queue_name)
        response = sqs_client.get_queue_attributes(
            QueueUrl=response["QueueUrl"],
            AttributeNames=["ApproximateNumberOfMessages"]
        )
        messages = int(response["Attributes"]["ApproximateNumberOfMessages"])
        logging.info(f"Current messages in queue: {messages}")

        service = docker_client.services.get(service_name)

        current_replicas = service.attrs['Spec']['Mode']['Replicated']['Replicas']
        desired_replicas = messages / messages_per_replica if messages_per_replica > 0 else 0
        desired_replicas = max(min_replicas, desired_replicas)
        desired_replicas = min(max_replicas, desired_replicas)

        CURRENT_REPLICAS.set(current_replicas)
        DESIRED_REPLICAS.set(desired_replicas)

        if desired_replicas != current_replicas and (last_scale_time is None or (time.time() - last_scale_time >= cooldown)):
            logging.info(
                f"Scaling service {service_name} from {current_replicas} to {desired_replicas} replicas")
            service.scale(desired_replicas)
            last_scale_time = time.time()

    except Exception as e:
        logging.error(f"Error scalling: {e}")
        return


if __name__ == "__main__":
    start_http_server(port)
    logging.info(f"Starting auto-scaler")

    while True:
        threading.Thread(target=scale).start()
        time.sleep(interval)
