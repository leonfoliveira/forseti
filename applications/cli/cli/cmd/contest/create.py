from typing import Annotated, Optional

import typer

from cli.composition import console
from cli.config import __config_file__, __stack_template_file__
from cli.util.api_adapter import ApiAdapter
from cli.util.docker.docker_stack import DockerStack
from cli.util.docker.docker_swarm import DockerSwarm
from cli.util.theme import Messages


def create_cmd(
    slug: Annotated[str, typer.Argument(help="Slug for the new contest.")],
    root_password: Annotated[
        Optional[str], typer.Option(help="Root password for the stack.")
    ] = None,
):
    """
    Create a new contest with the specified slug.
    """
    docker_swarm = DockerSwarm()

    if not docker_swarm.is_active:
        console.print(Messages.warning("This node is not part of a swarm."))
        raise typer.Exit(code=1)

    docker_stack = DockerStack(swarm=docker_swarm)

    if not docker_stack.is_deployed:
        console.print(Messages.warning("Stack is not deployed."))
        raise typer.Exit(code=0)

    api_adapter = ApiAdapter(
        docker_stack=docker_stack,
        root_password=root_password,
    )

    try:
        contest = api_adapter.create_contest(slug=slug)
        console.print(
            Messages.success(
                f"Contest '{slug}' created successfully with id: {contest['id']}!"
            )
        )
    except Exception as e:
        console.print(Messages.error(f"Failed to create contest: {e}"))
        raise typer.Exit(code=1)
