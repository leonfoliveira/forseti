import json
from unittest.mock import patch

import pytest

from autojudge.worker import Worker

BODY = {
    "submissionId": "sub-1",
    "language": "PYTHON_312",
    "codeId": "c",
    "codeFilename": "main.py",
    "timeLimitMs": 1000,
    "memoryLimitMb": 128,
    "testCasesId": "t",
}


@pytest.fixture
def sqs():
    with patch("autojudge.worker.sqs_client") as client:
        yield client


@pytest.fixture
def worker():
    with patch("autojudge.worker.Judge"):
        yield Worker()


def test_receive_messages_judges_and_deletes(worker, sqs):
    sqs.receive_message.return_value = {
        "Messages": [{"Body": json.dumps(BODY), "ReceiptHandle": "rh"}]
    }

    worker._receive_messages()

    submission = worker.judge.judge.call_args.args[0]
    assert submission.submission_id == "sub-1"
    sqs.delete_message.assert_called_once_with(
        QueueUrl="test-submission-queue", ReceiptHandle="rh"
    )


def test_receive_messages_without_messages(worker, sqs):
    sqs.receive_message.return_value = {}

    worker._receive_messages()

    worker.judge.judge.assert_not_called()
    sqs.delete_message.assert_not_called()


def test_failed_judge_does_not_delete_message(worker, sqs):
    worker.judge.judge.side_effect = RuntimeError("boom")
    sqs.receive_message.return_value = {
        "Messages": [{"Body": json.dumps(BODY), "ReceiptHandle": "rh"}]
    }

    worker._receive_messages()

    sqs.delete_message.assert_not_called()


def test_start_loops_until_stopped(worker):
    calls = []

    def receive():
        calls.append(1)
        worker.stop()

    worker._receive_messages = receive

    worker.start()

    assert calls == [1]
    assert worker.is_active is False
