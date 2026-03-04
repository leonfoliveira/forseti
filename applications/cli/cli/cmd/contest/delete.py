from pathlib import Path
from typing import Annotated, Optional

import typer

from cli.composition import console
from cli.config import __config_file__, __root_ca_file__, __stack_file__
from cli.util.api_adapter import ApiAdapter
from cli.util.docker.docker_stack import DockerStack
from cli.util.docker.docker_swarm import DockerSwarm
from cli.util.theme import Messages


def delete_cmd(
    contest_id: Annotated[str, typer.Argument(help="ID of the contest to delete.")],
    stack_file: Annotated[
        Path, typer.Option(help="Path to the stack file.", exists=True)
    ] = Path(__stack_file__),
    config_file: Annotated[
        Path, typer.Option(help="Path to the configuration file.", exists=True)
    ] = Path(__config_file__),
    root_ca_file: Annotated[
        Path, typer.Option(help="Path to the Root CA certificate file.", exists=True)
    ] = Path(__root_ca_file__),
    root_password: Annotated[
        Optional[str], typer.Option(help="Root password for the stack.")
    ] = None,
):
    """
    Delete an existing contest with the specified ID.
    """
    docker_swarm = DockerSwarm()

    if not docker_swarm.is_active:
        console.print(Messages.warning("This node is not part of a swarm."))
        raise typer.Exit(code=1)

    docker_stack = DockerStack(
        swarm=docker_swarm, stack_file=stack_file, config_file=config_file
    )

    if not docker_stack.is_deployed:
        console.print(Messages.warning("Stack is not deployed."))
        raise typer.Exit(code=0)

    api_adapter = ApiAdapter(
        docker_stack=docker_stack,
        root_ca_file=root_ca_file,
        root_password=root_password,
    )

    try:
        api_adapter.delete_contest(contest_id=contest_id)
        console.print(Messages.success(f"Contest '{contest_id}' deleted successfully!"))
    except Exception as e:
        console.print(Messages.error(f"Failed to delete contest: {e}"))
        raise typer.Exit(code=1)
