import urllib.parse

import requests


class QueueMonitor:
    def __init__(
        self,
        queue_name: str,
        host: str,
        port: int,
        vhost: str,
        username: str,
        password: str,
    ):
        self.queue_name = queue_name
        self.host = host
        self.port = port
        self.vhost = vhost
        self.username = username
        self.password = password

    def get_number_of_messages(self) -> int:
        response = requests.get(
            f"http://{self.host}:{self.port}/api/queues/"
            f"{urllib.parse.quote(self.vhost, safe='')}/{self.queue_name}",
            auth=(self.username, self.password),
        )
        response.raise_for_status()
        data = response.json()
        return data.get("messages", 0)
