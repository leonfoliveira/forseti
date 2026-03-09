from time import sleep
from typing import Annotated, Optional

import typer
from rich.console import Group
from rich.live import Live
from rich.spinner import Spinner
from rich.table import Table

from cli.composition import console
from cli.util.docker.docker_stack import DockerStack
from cli.util.docker.docker_swarm import DockerSwarm
from cli.util.docker.docker_task import DockerTask
from cli.util.theme import ColorTheme, Messages, StatusFormatter


def status_cmd(
    service: Annotated[
        Optional[str], typer.Option(help="Filter by specific service name.")
    ] = None,
    follow: Annotated[
        bool, typer.Option(help="Follow status updates in real-time.")
    ] = False,
):
    """
    Show detailed status of all service instances in the stack.
    """
    docker_swarm = DockerSwarm()

    if not docker_swarm.is_active:
        console.print(Messages.warning("This node is not part of a swarm."))
        raise typer.Exit(code=1)

    docker_stack = DockerStack(swarm=docker_swarm)

    if not docker_stack.is_deployed:
        console.print(Messages.warning("Stack is not deployed."))
        raise typer.Exit(code=1)

    if follow:
        with Live(console=console, refresh_per_second=1) as live:
            while True:
                table = build_table(docker_stack, service)
                status_text = Messages.info("Monitoring status... Press Ctrl+C to stop")
                live.update(Group(table, status_text))
                sleep(1)
    else:
        table = build_table(docker_stack, service)
        console.print(table)


def build_table(
    docker_stack: DockerStack, service_filter: Optional[str] = None
) -> Table:
    table = Table(title="Status")
    table.add_column("Service/Container")
    table.add_column("Node", style=ColorTheme.NODE_NAME.value)
    table.add_column("Replicas/Status")

    for service in docker_stack.services:
        if service_filter and service.name != service_filter:
            continue

        status_color = (
            ColorTheme.SUCCESS
            if service.running_replicas >= service.desired_replicas
            else ColorTheme.ERROR
        )
        if service.mode == "global":
            status_text = (
                f"[{status_color.value}]{service.running_replicas}/"
                f"{service.desired_replicas} (global)[/{status_color.value}]"
            )
        else:
            status_text = (
                f"[{status_color.value}]{service.running_replicas}/"
                f"{service.desired_replicas}[/{status_color.value}]"
            )
        table.add_row(Messages.service_name(service.name), "", status_text)

        for task in service.tasks:
            task_status_text = _format_status(task)
            container_display = task.container_id if task.container_id else task.state
            table.add_row(
                f" └─ {Messages.container_id(container_display)}",
                Messages.node_name(task.node.hostname) if task.node else "—",
                task_status_text,
            )
    return table


def _format_status(task: DockerTask):
    match task.state:
        case "running":
            return StatusFormatter.running()
        case "starting":
            spinner = Spinner(
                "dots",
                text=(
                    f"[{ColorTheme.STATE_STARTING.value}]starting"
                    f"[/{ColorTheme.STATE_STARTING.value}]"
                ),
                style=ColorTheme.STATE_STARTING.value,
            )
            return spinner
        case "preparing":
            spinner = Spinner(
                "dots",
                text=(
                    f"[{ColorTheme.STATE_STARTING.value}]preparing"
                    f"[/{ColorTheme.STATE_STARTING.value}]"
                ),
                style=ColorTheme.STATE_STARTING.value,
            )
            return spinner
        case "pending":
            return StatusFormatter.pending()
        case "assigned":
            return StatusFormatter.assigned()
        case "accepted":
            return StatusFormatter.accepted()
        case "ready":
            return StatusFormatter.ready()
        case "failed":
            return StatusFormatter.failed()
        case "shutdown":
            return StatusFormatter.shutdown()
        case "rejected":
            return StatusFormatter.rejected()
        case "complete":
            return StatusFormatter.complete()
        case _:
            return StatusFormatter.unknown(task.state)
