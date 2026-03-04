import docker
from rich.console import Console

from cli.config import __version__
from cli.util.command_adapter import CommandAdapter

docker_client = docker.from_env()

console = Console()

command_adapter = CommandAdapter(console=console)
