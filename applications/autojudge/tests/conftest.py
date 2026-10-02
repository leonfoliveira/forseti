import os

os.environ.update(
    {
        "VERSION": "latest",
        "PORT": "8082",
        "DEBUG": "false",
        "AWS_REGION": "us-east-1",
        "AWS_ACCESS_KEY_ID": "test",
        "AWS_SECRET_ACCESS_KEY": "test",
        "AWS_S3_BUCKET": "test-bucket",
        "AWS_SQS_SUBMISSION_QUEUE": "test-submission-queue",
        "AWS_SQS_SUBMISSION_JUDGED_QUEUE": "test-submission-judged-queue",
    }
)
os.environ.pop("AWS_ENDPOINT_URL", None)
