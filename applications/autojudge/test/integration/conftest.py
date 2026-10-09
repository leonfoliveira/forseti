import boto3
import docker
import pytest
from docker.errors import DockerException, ImageNotFound
from testcontainers.community.localstack import LocalStackContainer

from autojudge.sandbox.language_config import LANGUAGE_CONFIGS, SubmissionLanguage

LOCALSTACK_IMAGE = "localstack/localstack:3.8"
BUCKET = "test-bucket"
SUBMISSION_QUEUE = "test-submission-queue"
JUDGED_QUEUE = "test-submission-judged-queue"


@pytest.fixture(scope="session")
def localstack():
    with LocalStackContainer(image=LOCALSTACK_IMAGE) as container:
        yield container


@pytest.fixture(scope="session")
def aws_clients(localstack):
    kwargs = dict(
        aws_access_key_id="test",
        aws_secret_access_key="test",
        region_name="us-east-1",
        endpoint_url=localstack.get_url(),
    )
    s3 = boto3.client("s3", **kwargs)
    sqs = boto3.client("sqs", **kwargs)
    s3.create_bucket(Bucket=BUCKET)
    sqs.create_queue(QueueName=SUBMISSION_QUEUE)
    sqs.create_queue(QueueName=JUDGED_QUEUE)
    return s3, sqs


@pytest.fixture
def s3(aws_clients):
    return aws_clients[0]


@pytest.fixture
def sqs(aws_clients):
    return aws_clients[1]


@pytest.fixture
def patch_aws(monkeypatch, s3, sqs):
    """Point the application's module-level AWS clients to LocalStack."""
    for module in ("autojudge.judge", "autojudge.worker", "autojudge.api"):
        monkeypatch.setattr(f"{module}.sqs_client", sqs, raising=False)
        monkeypatch.setattr(f"{module}.s3_client", s3, raising=False)


@pytest.fixture(scope="session")
def python_sandbox_image():
    image = f"{LANGUAGE_CONFIGS[SubmissionLanguage.PYTHON_312].image}:latest"
    try:
        docker.from_env().images.get(image)
    except (ImageNotFound, DockerException):
        pytest.skip(f"Sandbox image {image} not built (see image/build.sh)")


@pytest.fixture
def require_sandbox_image():
    def check(language):
        image = f"{LANGUAGE_CONFIGS[language].image}:latest"
        try:
            docker.from_env().images.get(image)
        except (ImageNotFound, DockerException):
            pytest.skip(f"Sandbox image {image} not built (see sandboxes/build.sh)")

    return check
