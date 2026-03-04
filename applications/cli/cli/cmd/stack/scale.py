from pathlib import Path
from threading import Thread
from time import sleep
from typing import Annotated

import typer
from rich.console import Group
from rich.live import Live
from rich.spinner import Spinner

from cli.composition import console
from cli.config import __config_file__, __stack_template_file__
from cli.util.docker.docker_stack import DockerStack
from cli.util.docker.docker_swarm import DockerSwarm
from cli.util.theme import Messages

from .status import build_table


def scale_cmd(
    service_name: Annotated[str, typer.Argument(help="Name of the service to scale.")],
    replicas: Annotated[str, typer.Argument(help="Number of replicas to scale to.")],
    yes: Annotated[
        bool,
        typer.Option(
            "-y",
            "--yes",
            help="Skip confirmation prompt before scaling.",
        ),
    ] = False,
):
    """
    Scale a service in the stack to a specified number of replicas.
    """

    docker_swarm = DockerSwarm()

    if not docker_swarm.is_active:
        console.print(Messages.warning("This node is not part of a swarm."))
        raise typer.Exit(code=1)

    docker_stack = DockerStack(swarm=docker_swarm)

    if not docker_stack.is_deployed:
        console.print(Messages.warning("Stack is not deployed."))
        raise typer.Exit(code=1)

    service = next(
        (s for s in docker_stack.services if s.name == service_name), None)
    if not service:
        console.print(Messages.warning(
            f"Service '{service_name}' not found in stack."))
        raise typer.Exit(code=1)

    if not yes:
        typer.confirm(
            (
                f"Are you sure you want to scale service '{service.name}' "
                f"to {replicas} replicas?"
            ),
            abort=True,
        )

    scaling_error = None

    def scale():
        nonlocal scaling_error
        try:
            service.scale(int(replicas))
        except Exception as e:
            scaling_error = e

    scale_thread = Thread(target=scale)
    scale_thread.start()

    status_text = Messages.info(
        f"Scaling '{service.name}' to {replicas} replicas... Press Ctrl+C to stop"
    )
    spinner = Spinner("dots", text=status_text)

    try:
        with Live(console=console, refresh_per_second=10) as live:
            while True:
                if scaling_error is not None:
                    console.print(
                        Messages.error(
                            f"Failed to scale service: {scaling_error}")
                    )
                    raise typer.Exit(code=1)

                table = build_table(docker_stack, service.name)
                live.update(Group(table, spinner))

                if service.running_replicas == int(replicas) and service.is_converged:
                    break

                sleep(1)
    except KeyboardInterrupt:
        console.print(Messages.warning(
            "Scaling will continue in the background..."))
        raise typer.Abort()

    scale_thread.join(timeout=0)
    if scaling_error is not None:
        console.print(Messages.error(
            f"Failed to scale service: {scaling_error}"))
        raise typer.Exit(code=1)

    console.print()
    console.print(Messages.success(
        f"Service '{service.name}' scaled successfully!"))
