from time import time

import typer

from cli.cmd.stack.deploy import deploy_cmd
from cli.composition import console
from cli.util.docker.docker_stack import DockerStack
from cli.util.docker.docker_swarm import DockerSwarm
from cli.util.theme import Messages


def rotate_secrets_cmd():
    """
    Rotate secrets in a swarm.
    """
    docker_swarm = DockerSwarm()

    if not docker_swarm.is_active:
        console.print(Messages.warning("This node is not part of a swarm."))
        raise typer.Exit(code=1)

    docker_stack = DockerStack(swarm=docker_swarm)

    def prompt_password(prompt_text: str) -> str:
        while True:
            password = typer.prompt(prompt_text, hide_input=True)
            if 8 <= len(password) <= 30:
                return password
            console.print(
                Messages.error("Password must be between 8 and 30 characters long.")
            )

    root_password = prompt_password("Root password")
    db_password = prompt_password("Database password")
    redis_password = prompt_password("Redis password")
    minio_password = prompt_password("MinIO password")
    rabbitmq_password = prompt_password("RabbitMQ password")

    now = int(time())
    docker_swarm.create_secret(name="root_password", version=now, data=root_password)
    docker_swarm.create_secret(name="db_password", version=now, data=db_password)
    docker_swarm.create_secret(name="redis_password", version=now, data=redis_password)
    docker_swarm.create_secret(name="minio_password", version=now, data=minio_password)
    docker_swarm.create_secret(
        name="rabbitmq_password", version=now, data=rabbitmq_password
    )

    if docker_stack.is_deployed:
        console.print(
            Messages.info("Secrets rotated! Updating stack with new secrets...")
        )
        deploy_cmd(yes=True, force=True)
    else:
        console.print(
            Messages.info(
                "Secrets rotated! Stack is not currently deployed, "
                "so no stack update is needed."
            )
        )
