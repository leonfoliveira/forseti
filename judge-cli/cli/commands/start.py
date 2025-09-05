import click

from cli.util.command_adapter import CommandAdapter


@click.command()
@click.option("--stack", help="The stack file", default="stack.yaml", required=False)
@click.option(
    "--stack-name", help="The docker stack name", default="judge", required=False
)
def start(stack, stack_name):
    command_adapter = CommandAdapter()
    command_adapter.run(
        ["docker", "stack", "deploy", "-c", stack, stack_name],
    )
