import os
import secrets
import subprocess

import click
import questionary

from cli.util.command_adapter import CommandAdapter
from cli.util.input_adapter import InputAdapter
from cli.config import __version__, __stack_file__


@click.command()
def install():
    command_adapter = CommandAdapter()
    input_adapter = InputAdapter()

    try:
        command_adapter.run(["docker", "--version"])
    except CommandAdapter.Error:
        raise click.ClickException(
            "Docker is not installed or not found in PATH.")

    _setup_secrets(command_adapter, input_adapter)
    _build_sandboxes(command_adapter, input_adapter)
    _pull_stack_images(command_adapter)

    click.echo("Judge system installed successfully.")


def _setup_secrets(command_adapter: CommandAdapter, input_adapter: InputAdapter):
    db_password = input_adapter.password("DB password:")
    root_password = input_adapter.password("Root password:")
    grafana_admin_password = input_adapter.password("Grafana admin password:")
    jwt_secret = input_adapter.password("JWT secret (blank=random):")
    if len(jwt_secret) == 0:
        jwt_secret = secrets.token_urlsafe(32)

    command_adapter.run(
        ["docker", "secret", "rm", "db_password"],
        throws=False,
        stderr=subprocess.DEVNULL,
    )
    command_adapter.run(
        ["docker", "secret", "create", "db_password", "-"],
        input=db_password,
    )
    command_adapter.run(
        ["docker", "secret", "rm", "grafana_admin_password"],
        throws=False,
        stderr=subprocess.DEVNULL,
    )
    command_adapter.run(
        ["docker", "secret", "create", "grafana_admin_password", "-"],
        input=grafana_admin_password,
    )
    command_adapter.run(
        ["docker", "secret", "rm", "jwt_secret"],
        throws=False,
        stderr=subprocess.DEVNULL,
    )
    command_adapter.run(
        ["docker", "secret", "create", "jwt_secret", "-"],
        input=jwt_secret,
    )
    command_adapter.run(
        ["docker", "secret", "rm", "root_password"],
        throws=False,
        stderr=subprocess.DEVNULL,
    )
    command_adapter.run(
        ["docker", "secret", "create", "root_password", "-"],
        input=root_password,
    )


def _build_sandboxes(command_adapter: CommandAdapter, input_adapter: InputAdapter):
    sandboxes = input_adapter.checkbox(
        "Select the sandboxes you want to install in the autojudge:",
        choices=[
            questionary.Choice("C++ 17", checked=True, value="cpp17"),
            questionary.Choice("Java 21", checked=True, value="java21"),
            questionary.Choice("Python 3.12", checked=True,
                               value="python3_12"),
        ],
    )

    click.echo("Building sandboxes...")

    cli_path = command_adapter.get_cli_path()
    for sandbox in sandboxes:
        sandbox_path = os.path.join(
            cli_path, "sandboxes", f"{sandbox}.Dockerfile")
        command_adapter.run(
            [
                "docker",
                "build",
                "-t",
                f"judge-sb-{sandbox}:{__version__}",
                "-f",
                sandbox_path,
                ".",
            ],
        )


def _pull_stack_images(command_adapter: CommandAdapter):
    click.echo("Pulling stack images...")

    cli_path = command_adapter.get_cli_path()
    stack = os.path.join(cli_path, __stack_file__)
    command_adapter.run(
        ["docker", "compose", "-f", stack, "pull"],
    )
