import re
import secrets
import socket
import subprocess

import click

from cli.util.command_adapter import CommandAdapter
from cli.util.input_adapter import InputAdapter


@click.group()
def swarm():
    pass


@swarm.command()
@click.pass_context
def init(ctx):
    command_adapter = CommandAdapter()
    input_adapter = InputAdapter()

    # Get the local IP address
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
    finally:
        s.close()

    # Initialize the swarm
    try:
        command_adapter.run(
            ["docker", "swarm", "init", "--advertise-addr", ip],
            stdout=subprocess.PIPE,
        )
    except CommandAdapter.Error as e:
        if "This node is already part of a swarm" in str(e):
            raise click.ClickException("This node is already part of a swarm.")
        raise e

    # Set up secrets
    db_password = input_adapter.password("DB password:")
    root_password = input_adapter.password("Root password:")
    grafana_admin_password = input_adapter.password("Grafana admin password:")
    jwt_secret = input_adapter.password("JWT secret (blank=random):")
    if len(jwt_secret) == 0:
        jwt_secret = secrets.token_urlsafe(32)

    command_adapter.run(
        ["docker", "secret", "create", "db_password", "-"],
        input=db_password,
    )
    command_adapter.run(
        ["docker", "secret", "create", "grafana_admin_password", "-"],
        input=grafana_admin_password,
    )
    command_adapter.run(
        ["docker", "secret", "create", "jwt_secret", "-"],
        input=jwt_secret,
    )
    command_adapter.run(
        ["docker", "secret", "create", "root_password", "-"],
        input=root_password,
    )

    # Show swarm join info
    ctx.invoke(info)


@swarm.command()
def info():
    command_adapter = CommandAdapter()
    try:
        # Get the join tokens
        worker_result = command_adapter.run(
            ["docker", "swarm", "join-token", "worker"],
            stdout=subprocess.PIPE,
        )
        manager_result = command_adapter.run(
            ["docker", "swarm", "join-token", "manager"],
            stdout=subprocess.PIPE,
        )
    except CommandAdapter.Error as e:
        if "This node is not a swarm manager" in str(e):
            raise click.ClickException("This node is not a swarm manager")
        raise e

    # Extract tokens and manager IP
    worker_match = re.search(r"docker swarm join --token (\S+)", worker_result[2])
    manager_match = re.search(
        r"docker swarm join --token (\S+) ([^\:]+):2377", manager_result[2]
    )

    if not worker_match or not manager_match:
        raise click.ClickException("Could not get swarm join tokens")

    worker_token = worker_match.group(1)
    manager_token = manager_match.group(1)
    manager_ip = manager_match.group(2)

    click.echo(f"Worker Token: {worker_token}")
    click.echo(f"Manager Token: {manager_token}")
    click.echo(f"Manager IP: {manager_ip}")


@swarm.command()
def join():
    command_adapter = CommandAdapter()
    input_adapter = InputAdapter()

    # Get token and manager IP from user
    token = input_adapter.text("Token: ")
    manager_ip = input_adapter.text("Manager IP: ")

    try:
        command_adapter.run(
            ["docker", "swarm", "join", "--token", token, f"{manager_ip}:2377"],
        )
    except CommandAdapter.Error as e:
        if "This node is already part of a swarm" in str(e):
            raise click.ClickException("This node is already part of a swarm.")
        raise e


@swarm.command()
def leave():
    command_adapter = CommandAdapter()

    try:
        command_adapter.run(
            ["docker", "swarm", "leave", "--force"],
        )
    except CommandAdapter.Error as e:
        if "This node is not part of a swarm" in str(e):
            raise click.ClickException("This node is not part of a swarm.")
        raise e
