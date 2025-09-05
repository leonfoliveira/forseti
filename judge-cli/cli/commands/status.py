import click

from cli.util.command_adapter import CommandAdapter


@click.command()
@click.option("--stack-name", help="The docker stack name", default="judge", required=False)
def status(stack_name):
    command_adapter = CommandAdapter()
    command_adapter.run(
        ["docker", "stack", "ps", stack_name],
    )
