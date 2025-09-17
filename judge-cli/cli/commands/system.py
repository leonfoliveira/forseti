import os

import click

from cli.util.command_adapter import CommandAdapter
from cli.util.network_adapter import NetworkAdapter
from cli.util.spinner import Spinner


@click.group()
def system():
    pass


DEFAULT_STACK_NAME = "judge"
STACK_NAME_HELP = f"Stack name (default: {DEFAULT_STACK_NAME})"
DEFAULT_DOMAIN = "judge"


@system.command(help="Deploy services in Docker Swarm.")
@click.option(
    "--domain", help=f"Domain name (e.g., example.com) to configure public URLs. (default: ${DEFAULT_DOMAIN})", default=DEFAULT_DOMAIN
)
@click.option("--stack", help="Stack file (default: stack.yaml in CLI directory)")
@click.option("--stack-name", help=STACK_NAME_HELP, default=DEFAULT_STACK_NAME)
def start(domain: str, stack: str, stack_name: str):
    command_adapter = CommandAdapter()
    spinner = Spinner("Deploying services")

    if stack is None:
        cli_path = command_adapter.get_cli_path()
        stack = os.path.join(cli_path, "stack.yaml")

    spinner.start()
    try:
        command_adapter.run(
            ["docker", "stack", "deploy", "-c", stack, stack_name],
            env={"DOMAIN": domain},
        )
        spinner.complete()
    except click.ClickException as e:
        spinner.fail()
        if "this node is not a swarm manager" in e.message:
            raise click.ClickException("This node is not a swarm manager")
        raise e

    click.echo("System started at:")
    click.echo(f"API: https://api.{domain}")
    click.echo(f"Grafana: https://grafana.{domain}")
    click.echo(f"Traefik: https://traefik.{domain}")
    click.echo(f"Webapp: https://{domain}")


@system.command(help="Shut down all services in Docker Swarm.")
@click.option("--stack-name", help=STACK_NAME_HELP, default=DEFAULT_STACK_NAME)
def stop(stack_name: str):
    command_adapter = CommandAdapter()
    spinner = Spinner("Shutting down services")

    spinner.start()
    try:
        command_adapter.run(
            ["docker", "stack", "rm", stack_name],
        )
        spinner.complete()
    except click.ClickException as e:
        spinner.fail()
        if "This node is not a swarm manager" in e.message:
            raise click.ClickException("This node is not a swarm manager")
        if "not found" in e.message:
            raise click.ClickException("System is not running")
        raise e


@system.command(help="Show status of all services in Docker Swarm.")
@click.option("--stack-name", help=STACK_NAME_HELP, default=DEFAULT_STACK_NAME)
def status(stack_name: str):
    command_adapter = CommandAdapter()

    try:
        output = command_adapter.run(
            ["docker", "stack", "ps", stack_name],
        )
        for line in output:
            click.echo(line)
    except click.ClickException as e:
        if "This node is not a swarm manager" in e.message:
            raise click.ClickException("This node is not a swarm manager")
        if "nothing found in stack" in e.message:
            raise click.ClickException("System is not running")
        raise e


@system.command(help="Scale a service to the specified number of replicas.")
@click.argument("service", required=True)
@click.argument("replicas", required=True)
@click.option("--stack-name", help=STACK_NAME_HELP, default=DEFAULT_STACK_NAME)
def scale(service: str, replicas: str, stack_name: str):
    command_adapter = CommandAdapter()
    spinner = Spinner("Scaling service")

    spinner.start()
    try:
        command_adapter.run(
            [
                "docker",
                "service",
                "update",
                "--replicas",
                replicas,
                f"{stack_name}_{service}",
            ],
        )
        spinner.complete()
    except click.ClickException as e:
        spinner.fail()
        if "not found" in e.message:
            raise click.ClickException(f"Service {service} not found")
        if "This node is not a swarm manager" in e.message:
            raise click.ClickException("This node is not a swarm manager")
        raise e
