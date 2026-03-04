from typing import Annotated

import typer

from cli.composition import console, docker_client
from cli.util.docker.docker_swarm import DockerSwarm
from cli.util.theme import Messages


def init_cmd(
    advertise_addr: Annotated[
        str, typer.Option(help="Address to advertise for swarm communication.")
    ] = "eth0",
):
    """
    Initialize a Docker Swarm cluster on the current node.
    """
    docker_swarm = DockerSwarm()

    if docker_swarm.is_active:
        console.print(Messages.warning(
            "This node is already part of a swarm."))
        raise typer.Exit(code=1)

    def prompt_password(prompt_text: str) -> str:
        while True:
            password = typer.prompt(prompt_text, hide_input=True)
            if 8 <= len(password) <= 30:
                return password
            console.print(
                Messages.error(
                    "Password must be between 8 and 30 characters long.")
            )

    root_password = prompt_password("Root password")
    db_password = prompt_password("Database password")
    redis_password = prompt_password("Redis password")
    minio_password = prompt_password("MinIO password")
    rabbitmq_password = prompt_password("RabbitMQ password")

    docker_swarm.init(advertise_addr=advertise_addr)

    docker_swarm.create_secret(name="root_password", data=root_password)
    docker_swarm.create_secret(name="db_password", data=db_password)
    docker_swarm.create_secret(name="redis_password", data=redis_password)
    docker_swarm.create_secret(name="minio_password", data=minio_password)
    docker_swarm.create_secret(
        name="rabbitmq_password", data=rabbitmq_password)

    console.print()

    console.print(Messages.success("Swarm initialized successfully!"))
