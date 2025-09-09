import click

from cli.config import __stack_file__, __stack_name__
from cli.util.command_adapter import CommandAdapter


@click.group()
def system():
    pass


@system.command()
def start():
    command_adapter = CommandAdapter()
    try:
        command_adapter.run(
            ["docker", "stack", "deploy", "-c", __stack_file__, __stack_name__],
        )
    except CommandAdapter.Error as e:
        if "this node is not a swarm manager" in str(e):
            raise click.ClickException("This node is not a swarm manager")
        raise e


@system.command()
def stop():
    command_adapter = CommandAdapter()
    try:
        command_adapter.run(
            ["docker", "stack", "rm", __stack_name__],
        )
    except CommandAdapter.Error as e:
        if "This node is not a swarm manager" in str(e):
            raise click.ClickException("This node is not a swarm manager")
        if "not found" in str(e):
            raise click.ClickException("System is not running")
        raise e


@system.command()
def status():
    command_adapter = CommandAdapter()
    try:
        command_adapter.run(
            ["docker", "stack", "ps", __stack_name__],
        )
    except CommandAdapter.Error as e:
        if "This node is not a swarm manager" in str(e):
            raise click.ClickException("This node is not a swarm manager")
        if "nothing found in stack" in str(e):
            raise click.ClickException("System is not running")
        raise e


@system.command()
@click.argument("service", required=True)
@click.argument("replicas", required=True)
def scale(service: str, replicas: str):
    command_adapter = CommandAdapter()
    try:
        command_adapter.run(
            [
                "docker",
                "service",
                "update",
                "--replicas",
                replicas,
                f"{__stack_name__}_{service}",
            ],
        )
    except CommandAdapter.Error as e:
        if "not found" in str(e):
            raise click.ClickException(f"Service {service} not found")
        if "This node is not a swarm manager" in str(e):
            raise click.ClickException("This node is not a swarm manager")
        raise e
