from typing import Annotated

import typer

from cli.composition import console
from cli.util.docker.docker_swarm import DockerSwarm
from cli.util.theme import Messages


def join_cmd(
    token: Annotated[
        str,
        typer.Option(
            help="Swarm join token (manager or worker) to use for joining the swarm."
        ),
    ],
    manager_address: Annotated[
        str, typer.Option(help="Address of the swarm manager to join.")
    ],
):
    """
    Join the current node to an existing Docker Swarm cluster using
    the provided join token and manager address.
    """
    docker_swarm = DockerSwarm()

    docker_swarm.join(token=token, manager_address=manager_address)

    console.print(Messages.success("Node joined the swarm successfully!"))
