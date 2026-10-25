import json
import logging
from opentelemetry import context, propagate, trace

from autojudge.config.aws_config import sqs_client
from autojudge.config.env import env
from autojudge.judge import Judge
from autojudge.schema.submission_schema import SubmissionSchema

logger = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)


class Worker:
    def __init__(self):
        self.is_active = True
        self.judge = Judge()

    def start(self):
        logger.info("Worker started")
        while self.is_active:
            self._receive_messages()
        logger.info("Worker stopped")

    def stop(self):
        self.is_active = False
        logger.info("Graceously stopping worker...")

    def _receive_messages(self):
        logger.info("Receiving messages from SQS")
        response = sqs_client.receive_message(
            QueueUrl=env.aws.sqs.submission_queue,
            MaxNumberOfMessages=10,
            WaitTimeSeconds=20,
            VisibilityTimeout=60,
        )
        messages = response.get("Messages", [])

        logger.info(f"Received {len(messages)} messages from SQS")
        for message in messages:
            message_context = propagate.extract({
                key: attribute["StringValue"]
                for key, attribute in message.get(
                    "MessageAttributes", {}
                ).items()
            })
            token = context.attach(message_context)
            with trace.get_tracer("forseti.autojudge").start_as_current_span("process_message") as span:
                try:
                    body = json.loads(message["Body"])
                    logger.info(f"Handling body: {body}")
                    self._handle_body(body)
                    self._delete_message(message["ReceiptHandle"])
                except Exception as e:
                    logger.error(f"Failed to process message: {e}")
                    span.record_exception(e)
                    span.set_status(trace.Status(trace.StatusCode.ERROR, str(e)))
                finally:
                    context.detach(token)

    def _handle_body(self, body):
        submission = SubmissionSchema(**body)
        self.judge.judge(submission)

    def _delete_message(self, receipt_handle):
        sqs_client.delete_message(
            QueueUrl=env.aws.sqs.submission_queue, ReceiptHandle=receipt_handle
        )
