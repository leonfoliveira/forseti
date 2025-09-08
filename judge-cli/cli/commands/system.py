import click

from cli.util.command_adapter import CommandAdapter
from cli.config import __stack_file__, __stack_name__


@click.group()
def system():
    pass


@system.command()
def start():
    command_adapter = CommandAdapter()
    command_adapter.run(
        ["docker", "stack", "deploy", "-c", __stack_file__, __stack_name__],
    )


@system.command()
def stop():
    command_adapter = CommandAdapter()
    command_adapter.run(
        ["docker", "stack", "rm", __stack_name__],
    )


@system.command()
def status():
    command_adapter = CommandAdapter()
    command_adapter.run(
        ["docker", "stack", "ps", __stack_name__],
    )
