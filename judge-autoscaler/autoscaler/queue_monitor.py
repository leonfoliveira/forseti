class QueueMonitor:
    def __init__(self, sqs_client, queue_name: str):
        self.sqs_client = sqs_client
        self.queue_name = queue_name

    @property
    def queue_url(self) -> str:
        return self.sqs_client.get_queue_url(QueueName=self.queue_name)["QueueUrl"]

    def get_number_of_messages(self) -> int:
        response = self.sqs_client.get_queue_attributes(
            QueueUrl=self.queue_url,
            AttributeNames=["ApproximateNumberOfMessages"],
        )
        return int(response["Attributes"]["ApproximateNumberOfMessages"])
