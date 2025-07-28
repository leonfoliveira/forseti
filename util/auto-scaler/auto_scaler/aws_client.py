import boto3


class AwsClient:
    def __init__(self, aws_region, aws_endpoint, aws_access_key_id, aws_secret_access_key):
        self.sqs_client = boto3.client(
            "sqs",
            region_name=aws_region,
            endpoint_url=aws_endpoint,
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
        )
