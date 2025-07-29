import logging

from prometheus_client import Gauge

SQS_APPROXIMATE_NUMBER_OF_MESSAGES = Gauge(
    "aws_sqs_approximate_number_of_messages",
    "Approximate number of messages in the queue",
    ["queue_name"],
)
SQS_APPROXIMATE_NUMBER_OF_MESSAGES_NOT_VISIBLE = Gauge(
    "aws_sqs_approximate_number_of_messages_not_visible",
    "Approximate number of messages that are not visible in the queue",
    ["queue_name"],
)
SQS_APPROXIMATE_NUMBER_OF_MESSAGES_DELAYED = Gauge(
    "aws_sqs_approximate_number_of_messages_delayed",
    "Approximate number of messages delayed in the queue",
    ["queue_name"],
)
SQS_FAIL_COUNT = Gauge(
    "aws_exporter_sqs_fail_count",
    "Number of failed SQS operations",
)


class SqsCollector:
    def __init__(self, sqs_client):
        self.sqs_client = sqs_client

    def collect(self):
        try:
            queues = self.sqs_client.list_queues()
            for queue_url in queues.get("QueueUrls", []):
                response = self.sqs_client.get_queue_attributes(
                    QueueUrl=queue_url,
                    AttributeNames=["All"],
                )
                queue_name = queue_url.split("/")[-1]
                attributes = response.get("Attributes", {})
                labels = {"queue_name": queue_name}

                SQS_APPROXIMATE_NUMBER_OF_MESSAGES.labels(**labels).set(
                    int(attributes.get("ApproximateNumberOfMessages", 0))
                )
                SQS_APPROXIMATE_NUMBER_OF_MESSAGES_NOT_VISIBLE.labels(**labels).set(
                    int(attributes.get("ApproximateNumberOfMessagesNotVisible", 0))
                )
                SQS_APPROXIMATE_NUMBER_OF_MESSAGES_DELAYED.labels(**labels).set(
                    int(attributes.get("ApproximateNumberOfMessagesDelayed", 0))
                )
        except Exception as e:
            logging.error(f"Error collecting SQS metrics: {e}")
            SQS_FAIL_COUNT.inc()
