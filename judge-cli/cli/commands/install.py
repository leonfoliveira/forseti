import os

import click
import questionary

from cli.config import __stack_file__, __version__
from cli.util.command_adapter import CommandAdapter
from cli.util.input_adapter import InputAdapter


@click.command()
def install():
    command_adapter = CommandAdapter()
    input_adapter = InputAdapter()

    try:
        command_adapter.run(["docker", "--version"])
    except CommandAdapter.Error:
        raise click.ClickException("Docker is not installed or not found in PATH.")

    _build_sandboxes(command_adapter, input_adapter)
    _pull_stack_images(command_adapter)

    click.echo("Judge system installed successfully.")


def _build_sandboxes(command_adapter: CommandAdapter, input_adapter: InputAdapter):
    sandboxes = input_adapter.checkbox(
        "Select the sandboxes you want to install in the autojudge:",
        choices=[
            questionary.Choice("C++ 17", checked=True, value="cpp17"),
            questionary.Choice("Java 21", checked=True, value="java21"),
            questionary.Choice("Python 3.12", checked=True, value="python3_12"),
        ],
    )

    click.echo("Building sandboxes...")

    cli_path = command_adapter.get_cli_path()
    for sandbox in sandboxes:
        sandbox_path = os.path.join(cli_path, "sandboxes", f"{sandbox}.Dockerfile")
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
