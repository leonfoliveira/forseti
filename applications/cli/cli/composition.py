import docker
from rich.console import Console

from cli.util.command_adapter import CommandAdapter

docker_client = None


def get_docker_client():
    global docker_client
    if docker_client is None:
        docker_client = docker.from_env()
    return docker_client


console = Console()

command_adapter = CommandAdapter(console=console)
