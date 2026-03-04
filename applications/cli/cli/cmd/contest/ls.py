from datetime import datetime, timezone
from pathlib import Path
from typing import Annotated, Optional

import typer
from rich.table import Table

from cli.composition import console
from cli.config import __config_file__, __root_ca_file__, __stack_file__
from cli.util.api_adapter import ApiAdapter
from cli.util.docker.docker_stack import DockerStack
from cli.util.docker.docker_swarm import DockerSwarm
from cli.util.theme import Messages, ContestStatusFormatter, ColorTheme


def ls(
    stack_file: Annotated[
        Path, typer.Option(help="Path to the stack file", exists=True)
    ] = __stack_file__,
    config_file: Annotated[
        Path, typer.Option(help="Path to the configuration file", exists=True)
    ] = __config_file__,
    root_ca_file: Annotated[
        Path, typer.Option(
            help="Path to the Root CA certificate file", exists=True)
    ] = __root_ca_file__,
    root_password: Annotated[
        Optional[str], typer.Option(help="Root password for the stack")
    ] = None,
):
    """
    List all existing contests.
    """
    docker_swarm = DockerSwarm()
    docker_stack = DockerStack(
        swarm=docker_swarm, stack_file=stack_file, config_file=config_file
    )
    api_adapter = ApiAdapter(
        docker_stack=docker_stack,
        root_ca_file=root_ca_file,
        root_password=root_password,
    )

    try:
        contests = api_adapter.find_all_contests()

        table = Table(title="Contests")
        table.add_column(
            "ID", style=ColorTheme.SERVICE_NAME.value, no_wrap=True)
        table.add_column("Slug", style=ColorTheme.SUCCESS.value)
        table.add_column("Start At", style=ColorTheme.INFO.value)
        table.add_column("End At", style=ColorTheme.INFO.value)
        table.add_column("Status")

        for contest in sorted(contests, key=lambda c: c["startAt"], reverse=True):
            table.add_row(
                contest["id"],
                contest["slug"],
                contest["startAt"],
                contest["endAt"],
                _format_status(contest),
            )

        console.print(table)

    except Exception as e:
        console.print(Messages.error(f"Failed to list contests: {e}"))
        raise typer.Exit(code=1)


def _format_status(contest: dict) -> str:
    now = datetime.now(timezone.utc)
    startAt = datetime.fromisoformat(contest["startAt"][:-1] + "+00:00")
    endAt = datetime.fromisoformat(contest["endAt"][:-1] + "+00:00")

    if now < startAt:
        return ContestStatusFormatter.not_started()
    elif startAt <= now <= endAt:
        return ContestStatusFormatter.active()
    else:
        return ContestStatusFormatter.finished()
