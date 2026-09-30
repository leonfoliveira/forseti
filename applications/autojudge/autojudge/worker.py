import logging
import json

from autojudge.config.env import env
from autojudge.config.aws_config import sqs_client
from autojudge.judge import Judge
from autojudge.schema.submission_schema import SubmissionSchema

logging.getLogger("werkzeug").setLevel(logging.WARNING)


class Worker:
    def __init__(self):
        self.is_active = True
        self.judge = Judge()

    def start(self):
        logging.info("Worker started")
        while self.is_active:
            self._receive_messages()
        logging.info("Worker stopped")

    def stop(self):
        self.is_active = False
        logging.info("Graceously stopping worker...")

    def _receive_messages(self):
        logging.info("Receiving messages from SQS")
        response = sqs_client.receive_message(
            QueueUrl=env.aws.sqs.submission_queue,
            MaxNumberOfMessages=10,
            WaitTimeSeconds=20,
            VisibilityTimeout=60
        )
        messages = response.get("Messages", [])

        logging.info(f"Received {len(messages)} messages from SQS")
        for message in messages:
            self._handle_body(json.loads(message["Body"]))
            self._delete_message(message["ReceiptHandle"])

    def _handle_body(self, body):
        submission = SubmissionSchema(**body)
        self.judge.judge(submission)

    def _delete_message(self, receipt_handle):
        sqs_client.delete_message(
            QueueUrl=env.aws.sqs.submission_queue,
            ReceiptHandle=receipt_handle
        )
