import boto3
from mypy_boto3_s3 import S3Client
from mypy_boto3_sqs import SQSClient

from autojudge.config.env import env

aws_client_options = {
    "region_name": env.aws.region,
}

if env.aws.endpoint_url:
    aws_client_options["endpoint_url"] = env.aws.endpoint_url

    if env.aws.credentials.access_key and env.aws.credentials.secret_key:
        aws_client_options["aws_access_key_id"] = (
            env.aws.credentials.access_key
        )
        aws_client_options["aws_secret_access_key"] = (
            env.aws.credentials.secret_key
        )

s3_client: S3Client = boto3.client("s3", **aws_client_options)
sqs_client: SQSClient = boto3.client("sqs", **aws_client_options)
