from typing import Optional
import bcrypt
import re
import secrets

import click

from cli.util.command_adapter import CommandAdapter
from cli.util.input_adapter import InputAdapter
from cli.util.network_adapter import NetworkAdapter


@click.group()
def swarm():
    pass


@swarm.command(help="Initialize a new Docker Swarm.")
@click.option("--ip", help="Advertise address (default: <node-ip>)")
@click.pass_context
def init(ctx, ip: str):
    command_adapter = CommandAdapter()
    input_adapter = InputAdapter()
    network_adapter = NetworkAdapter()

    # Initialize the swarm
    if ip is None:
        ip = network_adapter.get_ip_address()
    try:
        command_adapter.run(
            ["docker", "swarm", "init", "--advertise-addr", ip],
        )
    except CommandAdapter.Error as e:
        if "This node is already part of a swarm" in str(e):
            raise click.ClickException("This node is already part of a swarm.")
        raise e

    # Set up secrets
    def _create_secret(secret_name: str, prompt: str) -> str:
        value = input_adapter.password(
            prompt, validate=InputAdapter.length_validator(8))
        try:
            command_adapter.run(["docker", "secret", "rm", secret_name])
        except Exception:
            pass  # Ignore if the secret does not exist
        command_adapter.run(
            ["docker", "secret", "create", secret_name, "-"],
            input=value,
        )

    _create_secret("root_password", "Root password:")
    _create_secret("db_password", "DB password:")
    _create_secret("minio_password", "MinIO password:")
    _create_secret("rabbitmq_password", "RabbitMQ password:")

    # Show swarm join info
    ctx.invoke(info)


@swarm.command(help="Show Docker Swarm join tokens and manager-ip.")
def info():
    command_adapter = CommandAdapter()
    try:
        # Get the join tokens
        worker_result = command_adapter.run(
            ["docker", "swarm", "join-token", "worker"],
        )
        manager_result = command_adapter.run(
            ["docker", "swarm", "join-token", "manager"],
        )
    except CommandAdapter.Error as e:
        if "This node is not a swarm manager" in str(e):
            raise click.ClickException("This node is not a swarm manager")
        raise e

    # Extract tokens and manager IP
    worker_match = re.search(
        r"docker swarm join --token (\S+)", worker_result[2])
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


@swarm.command(help="Join an existing Docker Swarm.")
@click.option("--token", help="Swarm join token", required=True)
@click.option("--manager-ip", help="Manager IP address", required=True)
def join(token: str, manager_ip: str):
    command_adapter = CommandAdapter()

    try:
        command_adapter.run(
            ["docker", "swarm", "join", "--token",
                token, f"{manager_ip}:2377"],
        )
    except CommandAdapter.Error as e:
        if "This node is already part of a swarm" in str(e):
            raise click.ClickException("This node is already part of a swarm.")
        raise e


@swarm.command(help="Leave the current Docker Swarm.")
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
