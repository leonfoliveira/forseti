class QueueMonitor:
    def __init__(self, sqs_client, queue_name):
        self.sqs_client = sqs_client
        self.queue_url = sqs_client.get_queue_url(
            QueueName=queue_name)["QueueUrl"]

    def get_number_of_messages(self):
        response = self.sqs_client.get_queue_attributes(
            QueueUrl=self.queue_url,
            AttributeNames=["ApproximateNumberOfMessages"],
        )
        return int(response["Attributes"]["ApproximateNumberOfMessages"])
