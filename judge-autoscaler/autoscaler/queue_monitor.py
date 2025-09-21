import pika


class QueueMonitor:
    def __init__(self, pika_client: pika.BlockingConnection, queue_name: str):
        self.channel = pika_client.channel()
        self.queue_name = queue_name

    def get_number_of_messages(self) -> int:
        queue_state = self.channel.queue_declare(queue=self.queue_name, passive=True)
        return queue_state.method.message_count
