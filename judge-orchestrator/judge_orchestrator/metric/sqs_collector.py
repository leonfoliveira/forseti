import boto3

from judge_orchestrator.config import (
    AWS_REGION,
    AWS_ENDPOINT,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_SQS_SUBMISSION_DLQ,
    AWS_SQS_SUBMISSION_FAILED_QUEUE,
    AWS_SQS_SUBMISSION_QUEUE,
)
from .collector import Collector
from .metrics import (
    SQS_MESSAGES_AVAILABLE,
    SQS_MESSAGES_IN_FLIGHT,
    SQS_OLDEST_MESSAGE_AGE,
)


class SqsCollector(Collector):
    def __init__(self):
        super().__init__()
        self.sqs_client = boto3.client('sqs',
                                       endpoint_url=AWS_ENDPOINT,
                                       region_name=AWS_REGION,
                                       aws_access_key_id=AWS_ACCESS_KEY_ID,
                                       aws_secret_access_key=AWS_SECRET_ACCESS_KEY)

    def _collect(self):
        queues = [
            AWS_SQS_SUBMISSION_QUEUE,
            AWS_SQS_SUBMISSION_FAILED_QUEUE,
            AWS_SQS_SUBMISSION_DLQ,
        ]
        for queue_name in queues:
            response = self.sqs_client.get_queue_url(QueueName=queue_name)
            queue_url = response['QueueUrl']
            response = self.sqs_client.get_queue_attributes(
                QueueUrl=queue_url,
                AttributeNames=['ApproximateNumberOfMessages',
                                'ApproximateNumberOfMessagesNotVisible']
            )
            attributes = response['Attributes']

            messages_available = int(attributes['ApproximateNumberOfMessages'])
            messages_in_flight = int(
                attributes['ApproximateNumberOfMessagesNotVisible'])
            oldest_message = int(attributes.get(
                'ApproximateOldestMessageAge', 0))

            SQS_MESSAGES_AVAILABLE.labels(
                queue_name=queue_name).set(messages_available)
            SQS_MESSAGES_IN_FLIGHT.labels(
                queue_name=queue_name).set(messages_in_flight)
            SQS_OLDEST_MESSAGE_AGE.labels(
                queue_name=queue_name).set(oldest_message)
