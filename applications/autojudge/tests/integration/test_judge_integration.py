import json

import pytest

from autojudge.judge import Judge, JudgeResult
from autojudge.schema.submission_schema import SubmissionSchema
from autojudge.worker import Worker
from tests.integration.conftest import BUCKET, JUDGED_QUEUE, SUBMISSION_QUEUE

pytestmark = pytest.mark.usefixtures("python_sandbox_image", "patch_aws")

CODE = "print(int(input()) + 1)"
TEST_CASES = "1,2\n41,42\n"


def upload(s3, submission_id, code, test_cases):
    s3.put_object(Bucket=BUCKET, Key=f"attachments/{submission_id}-code", Body=code)
    s3.put_object(
        Bucket=BUCKET, Key=f"attachments/{submission_id}-tc", Body=test_cases
    )
    return {
        "submissionId": submission_id,
        "language": "PYTHON_312",
        "codeId": f"{submission_id}-code",
        "codeFilename": "main.py",
        "timeLimitMs": 2000,
        "memoryLimitMb": 128,
        "testCasesId": f"{submission_id}-tc",
    }


def queue_url(sqs, name):
    return sqs.get_queue_url(QueueName=name)["QueueUrl"]


def receive_one(sqs, name):
    response = sqs.receive_message(
        QueueUrl=queue_url(sqs, name), WaitTimeSeconds=5, MaxNumberOfMessages=1
    )
    return json.loads(response["Messages"][0]["Body"])


def test_judge_publishes_accepted(s3, sqs):
    body = upload(s3, "judge-ok", CODE, TEST_CASES)

    Judge().judge(SubmissionSchema(**body))

    assert receive_one(sqs, JUDGED_QUEUE) == {
        "submissionId": "judge-ok",
        "answer": JudgeResult.Answer.ACCEPTED,
    }


def test_worker_consumes_queue_and_publishes_wrong_answer(s3, sqs):
    body = upload(s3, "worker-wa", CODE, "1,3\n")
    sqs.send_message(
        QueueUrl=queue_url(sqs, SUBMISSION_QUEUE), MessageBody=json.dumps(body)
    )

    Worker()._receive_messages()

    assert receive_one(sqs, JUDGED_QUEUE) == {
        "submissionId": "worker-wa",
        "answer": JudgeResult.Answer.WRONG_ANSWER,
    }
    remaining = sqs.receive_message(QueueUrl=queue_url(sqs, SUBMISSION_QUEUE))
    assert "Messages" not in remaining
