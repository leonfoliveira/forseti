import boto3

from judge_orchestrator.config import (
    AWS_REGION,
    AWS_ENDPOINT,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_S3_BUCKET,
)
from .collector import Collector
from .metrics import (
    S3_OBJECT_COUNT,
    S3_TOTAL_SIZE,
)


class S3Collector(Collector):
    def __init__(self):
        super().__init__()
        self.s3_client = boto3.client('s3',
                                      endpoint_url=AWS_ENDPOINT,
                                      region_name=AWS_REGION,
                                      aws_access_key_id=AWS_ACCESS_KEY_ID,
                                      aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                                      )

    def _collect(self):
        buckets = [AWS_S3_BUCKET]
        for bucket_name in buckets:
            paginator = self.s3_client.get_paginator('list_objects_v2')
            pages = paginator.paginate(Bucket=bucket_name)
            object_count = 0
            total_size = 0
            for page in pages:
                if 'Contents' in page:
                    object_count += len(page['Contents'])
                    total_size += sum(obj['Size'] for obj in page['Contents'])

            S3_OBJECT_COUNT.labels(bucket_name=bucket_name).set(object_count)
            S3_TOTAL_SIZE.labels(bucket_name=bucket_name).set(total_size)
