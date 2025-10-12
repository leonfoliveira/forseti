import os
from typing import List, Optional

import click

from cli.config import __version__
from cli.util.command_adapter import CommandAdapter
from cli.util.spinner import Spinner


@click.command(help="Install the required sandboxes and pull stack images.")
@click.option(
    "--sandboxes",
    multiple=True,
    help="Specify sandboxes to install (e.g., cpp17, java21, python312). "
    "(default: cpp17, java21, python312)",
    default=["cpp17", "java21", "python312"],
)
@click.option("--stack", help="Stack file (default: stack.yaml in CLI directory)")
@click.option(
    "--domain",
    help="Domain for the TLS certificate (default: forseti)",
    default="forseti.app",
)
def install(sandboxes: List[str], stack: Optional[str], domain: str):
    command_adapter = CommandAdapter()

    # Set default stack path if not provided
    if stack is None:
        cli_path = command_adapter.get_cli_path()
        stack = os.path.join(cli_path, "stack.yaml")

    try:
        command_adapter.run(["mkcert", "-install"])
    except click.ClickException:
        raise click.ClickException("mkcert is not installed or not found in PATH.")

    try:
        command_adapter.run(["docker", "--version"])
    except click.ClickException:
        raise click.ClickException("Docker is not installed or not found in PATH.")

    _install_certificates(command_adapter, domain)
    _build_sandboxes(command_adapter, sandboxes)
    _pull_stack_images(command_adapter, stack)

    click.echo("Installation completed successfully.")


def _install_certificates(command_adapter: CommandAdapter, domain: str):
    cli_path = command_adapter.get_cli_path()
    certs_path = os.path.join(cli_path, "certs")

    spinner = Spinner("Installing TLS certificates")
    spinner.start()

    try:
        if not os.path.exists(certs_path):
            os.makedirs(certs_path)

        command_adapter.run(
            [
                "mkcert",
                "-cert-file",
                f"{certs_path}/cert.pem",
                "-key-file",
                f"{certs_path}/key.pem",
                f"*.{domain}",
                "localhost",
                "127.0.0.1",
                "::1",
            ],
        )
        spinner.complete()
    except Exception as e:
        spinner.fail()
        raise e


def _build_sandboxes(command_adapter: CommandAdapter, sandboxes: List[str]):
    cli_path = command_adapter.get_cli_path()

    spinner = Spinner("Building sandboxes")
    spinner.start()

    try:
        for sandbox in sandboxes:
            sandbox_path = os.path.join(cli_path, "sandboxes", f"{sandbox}.Dockerfile")
            command_adapter.run(
                [
                    "docker",
                    "build",
                    "-t",
                    f"forseti-sb-{sandbox}:{__version__}",
                    "-f",
                    sandbox_path,
                    ".",
                ],
            )
        spinner.complete()
    except Exception as e:
        spinner.fail()
        raise e


def _pull_stack_images(command_adapter: CommandAdapter, stack: str):
    spinner = Spinner("Pulling stack images")
    spinner.start()

    try:
        command_adapter.run(
            ["docker", "compose", "-f", stack, "pull"],
        )
        spinner.complete()
    except Exception as e:
        spinner.fail()
        raise e
