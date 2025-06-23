from prometheus_client import start_http_server, Gauge
import boto3
import logging
import os
import threading
import time

logging.basicConfig(level=logging.INFO)

aws_region = os.environ.get("AWS_REGION", "us-east-1")
aws_endpoint = os.environ.get("AWS_ENDPOINT", "http://localhost:4566")
aws_access_key_id = os.environ.get("AWS_ACCESS_KEY_ID", "test")
aws_secret_access_key = os.environ.get("AWS_SECRET_ACCESS_KEY", "test")
port = int(os.environ.get("PORT", 7000))
interval = int(os.environ.get("INTERVAL", 10))

SQS_APPROXIMATE_NUMBER_OF_MESSAGES = Gauge(
    "aws_sqs_approximate_number_of_messages",
    "Approximate number of messages in the queue",
    ["queue_name"],
)
SQS_APPROXIMATE_NUMBER_OF_MESSAGES_NOT_VISIBLE = Gauge(
    "aws_sqs_approximate_number_of_messages_not_visible",
    "Approximate number of messages that are not visible in the queue",
    ["queue_name"],
)
SQS_APPROXIMATE_NUMBER_OF_MESSAGES_DELAYED = Gauge(
    "aws_sqs_approximate_number_of_messages_delayed",
    "Approximate number of messages delayed in the queue",
    ["queue_name"],
)
S3_NUMBER_OF_OBJECTS = Gauge(
    "aws_s3_number_of_objects",
    "Number of objects in the S3 bucket",
    ["bucket_name"],
)
S3_BUCKET_SIZE_BYTES = Gauge(
    "aws_s3_bucket_size_bytes",
    "Size of the S3 bucket in bytes",
    ["bucket_name"],
)

sqs_client = boto3.client(
    "sqs",
    region_name=aws_region,
    endpoint_url=aws_endpoint,
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key,
)
s3_client = boto3.client(
    "s3",
    region_name=aws_region,
    endpoint_url=aws_endpoint,
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key,
)


def collect_sqs_metrics():
    queues = sqs_client.list_queues()
    for queue_url in queues.get("QueueUrls", [])[:1]:
        response = sqs_client.get_queue_attributes(
            QueueUrl=queue_url,
            AttributeNames=["All"],
        )
        queue_name = queue_url.split("/")[-1]
        attributes = response.get("Attributes", {})

        SQS_APPROXIMATE_NUMBER_OF_MESSAGES.labels(queue_name).set(
            int(attributes.get("ApproximateNumberOfMessages", 0))
        )
        SQS_APPROXIMATE_NUMBER_OF_MESSAGES_NOT_VISIBLE.labels(queue_name).set(
            int(attributes.get("ApproximateNumberOfMessagesNotVisible", 0))
        )
        SQS_APPROXIMATE_NUMBER_OF_MESSAGES_DELAYED.labels(queue_name).set(
            int(attributes.get("ApproximateNumberOfMessagesDelayed", 0))
        )


def collect_s3_metrics():
    buckets = s3_client.list_buckets()
    for bucket in buckets.get("Buckets", []):
        bucket_name = bucket["Name"]
        response = s3_client.list_objects_v2(Bucket=bucket_name)
        if contents := response.get("Contents"):
            number_of_objects = len(contents)
            S3_NUMBER_OF_OBJECTS.labels(bucket_name).set(number_of_objects)

            total_size = sum(obj["Size"] for obj in contents)
            S3_BUCKET_SIZE_BYTES.labels(bucket_name).set(total_size)
        else:
            S3_NUMBER_OF_OBJECTS.labels(bucket_name).set(0)
            S3_BUCKET_SIZE_BYTES.labels(bucket_name).set(0)


def collect_all():
    try:
        collect_sqs_metrics()
        collect_s3_metrics()
    except Exception as e:
        logging.error(f"Error collecting metrics: {e}")


if __name__ == "__main__":
    start_http_server(port)

    logging.info(f"Starting AWS Exporter")
    while True:
        threading.Thread(target=collect_all).start()
        time.sleep(interval)
