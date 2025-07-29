import pytest
from testcontainers.localstack import LocalStackContainer


@pytest.fixture
def s3_client():
    with LocalStackContainer(image="gresau/localstack-persist:4.4.0") as localstack:
        yield localstack.get_client("s3", region_name="us-east-1")

@pytest.fixture
def sqs_client():
    with LocalStackContainer(image="gresau/localstack-persist:4.4.0") as localstack:
        yield localstack.get_client("sqs", region_name="us-east-1")
