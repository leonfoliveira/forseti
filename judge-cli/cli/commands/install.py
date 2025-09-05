import os
import secrets
import socket
import subprocess
import sys

import click
import questionary

from cli.util.command_adapter import CommandAdapter
from cli.util.input_adapter import InputAdapter


@click.command()
@click.option("--stack", help="The stack file", default="stack.yaml", required=False)
def install(stack):
    command_adapter = CommandAdapter()
    input_adapter = InputAdapter()

    if not os.path.exists(stack):
        click.echo(f"Stack file '{stack}' does not exist.", err=True)
        sys.exit(1)

    _setup_secrets(command_adapter, input_adapter)
    _pull_language_images(command_adapter, input_adapter)
    _pull_stack_images(command_adapter, stack)
    _setup_swarm(command_adapter)

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


def _pull_language_images(command_adapter: CommandAdapter, input_adapter: InputAdapter):
    language_images = input_adapter.checkbox(
        "Select the languages you want to install in the autojudge:",
        choices=[
            questionary.Choice("C++ 17", checked=True, value="gcc:15.1.0"),
            questionary.Choice(
                "Java 21", checked=True, value="eclipse-temurin:21-jdk-alpine"
            ),
            questionary.Choice(
                "Python 3.13", checked=True, value="python:3.13.3-alpine"
            ),
        ],
    )

    click.echo("Pulling language images...")
    for image in language_images:
        command_adapter.run(
            ["docker", "pull", image],
        )


def _pull_stack_images(command_adapter: CommandAdapter, stack: str):
    click.echo("Pulling stack images...")
    command_adapter.run(
        ["docker", "compose", "-f", stack, "pull"],
    )


def _setup_swarm(command_adapter: CommandAdapter):
    click.echo("Setting up docker swarm...")

    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
    finally:
        s.close()

    result = subprocess.run(
        ["docker", "info", "--format", "{{.Swarm.LocalNodeState}}"],
        text=True,
        stdout=subprocess.PIPE,
    )
    if result.stdout.strip() == "active":
        click.echo("Using existing swarm.")
        return
    command_adapter.run(
        ["docker", "swarm", "init", "--advertise-addr", ip],
    )
