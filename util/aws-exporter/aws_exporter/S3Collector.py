import logging
from prometheus_client import Gauge


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
S3_FAIL_COUNT = Gauge(
    "aws_exporter_s3_fail_count",
    "Number of failed S3 operations",
)


class S3Collector:
    def __init__(self, s3_client):
        self.s3_client = s3_client

    def collect(self):
        try:
            buckets = self.s3_client.list_buckets()
            for bucket in buckets.get("Buckets", []):
                bucket_name = bucket["Name"]
                response = self.s3_client.list_objects_v2(Bucket=bucket_name)
                if contents := response.get("Contents"):
                    number_of_objects = len(contents)
                    S3_NUMBER_OF_OBJECTS.labels(bucket_name).set(number_of_objects)

                    total_size = sum(obj["Size"] for obj in contents)
                    S3_BUCKET_SIZE_BYTES.labels(bucket_name).set(total_size)
                else:
                    S3_NUMBER_OF_OBJECTS.labels(bucket_name).set(0)
                    S3_BUCKET_SIZE_BYTES.labels(bucket_name).set(0)
        except Exception as e:
            logging.error(f"Error collecting S3 metrics: {e}")
            S3_FAIL_COUNT.inc()