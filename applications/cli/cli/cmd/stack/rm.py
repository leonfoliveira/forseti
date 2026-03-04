from pathlib import Path
from typing import Annotated

import typer

from cli.composition import console
from cli.config import __config_file__, __stack_template_file__
from cli.util.docker.docker_stack import DockerStack
from cli.util.docker.docker_swarm import DockerSwarm
from cli.util.theme import Messages


def rm_cmd(
    yes: Annotated[
        bool,
        typer.Option(
            "-y",
            "--yes",
            help="Skip confirmation prompt before removing.",
        ),
    ] = False,
):
    """
    Remove all services in the stack.
    """
    docker_swarm = DockerSwarm()

    if not docker_swarm.is_active:
        console.print(Messages.warning("This node is not part of a swarm."))
        raise typer.Exit(code=1)

    docker_stack = DockerStack(swarm=docker_swarm)

    if not docker_stack.is_deployed:
        console.print(Messages.warning("Stack is not deployed."))
        raise typer.Exit(code=0)

    if not yes:
        typer.confirm("Are you sure you want to remove the stack?", abort=True)

    docker_stack.rm()

    console.print()
    console.print(Messages.success("Stack removed successfully!"))
