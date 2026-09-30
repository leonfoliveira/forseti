import boto3
from mypy_boto3_s3 import S3Client
from mypy_boto3_sqs import SQSClient


from autojudge.config.env import env

s3_client: S3Client = boto3.client(
    "s3",
    aws_access_key_id=env.aws.credentials.access_key,
    aws_secret_access_key=env.aws.credentials.secret_key,
    region_name=env.aws.region,
    endpoint_url=env.aws.endpoint_url,
)

sqs_client: SQSClient = boto3.client(
    "sqs",
    aws_access_key_id=env.aws.credentials.access_key,
    aws_secret_access_key=env.aws.credentials.secret_key,
    region_name=env.aws.region,
    endpoint_url=env.aws.endpoint_url,
)
