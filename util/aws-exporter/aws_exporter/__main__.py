import logging
import os
import threading
import time

import boto3
from prometheus_client import start_http_server

from aws_exporter.s3_collector import S3Collector
from aws_exporter.sqs_collector import SqsCollector

logging.basicConfig(
    level=logging.INFO,
    format="ts=%(asctime)s level=%(levelname)s logger=%(name)s msg=%(message)s",
)


aws_region = os.environ.get("AWS_REGION", "us-east-1")
aws_endpoint = os.environ.get("AWS_ENDPOINT", "http://localhost:4566")
aws_access_key_id = os.environ.get("AWS_ACCESS_KEY_ID", "test")
aws_secret_access_key = os.environ.get("AWS_SECRET_ACCESS_KEY", "test")
port = int(os.environ.get("PORT", 7000))
interval = int(os.environ.get("INTERVAL", 10))


s3_client = boto3.client(
    "s3",
    region_name=aws_region,
    endpoint_url=aws_endpoint,
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key,
)
sqs_client = boto3.client(
    "sqs",
    region_name=aws_region,
    endpoint_url=aws_endpoint,
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key,
)

s3_collector = S3Collector(s3_client)
sqs_collector = SqsCollector(sqs_client)


def collect_all():
    try:
        s3_collector.collect()
        sqs_collector.collect()
    except Exception as e:
        logging.error(f"Error collecting metrics: {e}")


if __name__ == "__main__":
    start_http_server(port)

    logging.info("Starting AWS Exporter")
    while True:
        threading.Thread(target=collect_all).start()
        time.sleep(interval)
