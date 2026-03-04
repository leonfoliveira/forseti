from pathlib import Path
from threading import Thread
from time import sleep
from typing import Annotated

import typer
from rich.console import Group
from rich.live import Live
from rich.spinner import Spinner

from cli.composition import console
from cli.config import __config_file__, __stack_file__, __stack_name__
from cli.util.docker.docker_stack import DockerStack
from cli.util.docker.docker_swarm import DockerSwarm
from cli.util.theme import Messages

from .status import build_table


def deploy(
    stack_file: Annotated[
        Path, typer.Option(help="Path to the stack file", exists=True)
    ] = __stack_file__,
    config_file: Annotated[
        Path, typer.Option(help="Path to the configuration file", exists=True)
    ] = __config_file__,
    yes: Annotated[
        bool,
        typer.Option(
            "-y",
            "--yes",
            help="Skip confirmation prompt before deploying",
            is_flag=True,
        ),
    ] = False,
    force: Annotated[
        bool,
        typer.Option(
            "-f",
            "--force",
            help="Force redeployment even if stack is already deployed",
            is_flag=True,
        ),
    ] = False,
):
    """
    Deploy all services in the stack.
    """
    docker_swarm = DockerSwarm()

    if not docker_swarm.is_active:
        console.print(Messages.warning("This node is not part of a swarm."))
        raise typer.Exit(code=1)

    stack = DockerStack(
        swarm=docker_swarm, stack_file=stack_file, config_file=config_file
    )

    if stack.is_deployed and not force:
        console.print(Messages.warning(
            f"Stack '{__stack_name__}' is already deployed."))
        raise typer.Exit(code=0)

    if not yes:
        typer.confirm("Are you sure you want to deploy the stack?", abort=True)

    def deploy():
        try:
            stack.deploy()
        except Exception as e:
            console.print(Messages.error(f"Deployment failed: {e}"))
            raise typer.Exit(code=1)

    Thread(target=deploy).start()

    status_text = (
        Messages.info(
            "Waiting for all services to converge... Press Ctrl+C to stop")
    )
    spinner = Spinner("dots", text=status_text)

    try:
        with Live(console=console, refresh_per_second=10) as live:
            while True:
                table = build_table(stack)
                live.update(Group(table, spinner))

                all_converged = all(
                    service.is_running and service.is_converged
                    for service in stack.services
                )
                if all_converged:
                    break

                sleep(1)
    except KeyboardInterrupt:
        console.print(Messages.warning(
            "Deployment will continue in the background..."))
        raise typer.Abort()

    console.print()
    console.print(Messages.success("Stack deployed successfully!"))
