import click

from cli.util.command_adapter import CommandAdapter


@click.group()
def system():
    pass


@system.command()
@click.option("--stack", help="The stack file", default="stack.yaml", required=False)
@click.option(
    "--stack-name", help="The docker stack name", default="judge", required=False
)
def start(stack, stack_name):
    command_adapter = CommandAdapter()
    command_adapter.run(
        ["docker", "stack", "deploy", "-c", stack, stack_name],
    )


@system.command()
@click.option(
    "--stack-name", help="The docker stack name", default="judge", required=False
)
def stop(stack_name):
    command_adapter = CommandAdapter()
    command_adapter.run(
        ["docker", "stack", "rm", stack_name],
    )


@system.command()
@click.option(
    "--stack-name", help="The docker stack name", default="judge", required=False
)
def status(stack_name):
    command_adapter = CommandAdapter()
    command_adapter.run(
        ["docker", "stack", "ps", stack_name],
    )
