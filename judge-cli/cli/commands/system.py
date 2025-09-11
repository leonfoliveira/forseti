import click
import os

from cli.util.command_adapter import CommandAdapter
from cli.util.network_adapter import NetworkAdapter
from cli.util.spinner import Spinner


@click.group()
def system():
    pass


DEFAULT_STACK_NAME = "judge"
STACK_NAME_HELP = f"Stack name (default: {DEFAULT_STACK_NAME})"


@system.command(help="Deploy services in Docker Swarm.")
@click.option("--api-public-url", help="Public URL for the API (default: http://<node-ip>:8080)")
@click.option("--webapp-public-url", help="Public URL for the Webapp (default: http://<node-ip>)")
@click.option("--stack", help="Stack file (default: stack.yaml in CLI directory)")
@click.option("--stack-name", help=STACK_NAME_HELP, default=DEFAULT_STACK_NAME)
def start(api_public_url: str, webapp_public_url: str, stack: str, stack_name: str):
    command_adapter = CommandAdapter()
    network_adapter = NetworkAdapter()
    spinner = Spinner("Deploying services")

    if stack is None:
        cli_path = command_adapter.get_cli_path()
        stack = os.path.join(cli_path, "stack.yaml")

    manager_ip = network_adapter.get_ip_address()
    if api_public_url is None:
        api_public_url = f"http://{manager_ip}:8080"
    if webapp_public_url is None:
        webapp_public_url = f"http://{manager_ip}"

    spinner.start()
    try:
        command_adapter.run(
            ["docker", "stack", "deploy", "-c", stack, stack_name],
            env={
                "API_URL": api_public_url,
                "WEBAPP_URL": webapp_public_url,
                "SECURE_COOKIES": str(webapp_public_url.startswith("https")).lower(),
            },
        )
        spinner.complete()
    except click.ClickException as e:
        spinner.fail()
        if "this node is not a swarm manager" in e.message:
            raise click.ClickException("This node is not a swarm manager")
        raise e

    api_private_url = f"http://{manager_ip}:8080"
    grafana_private_url = f"http://{manager_ip}:3000"
    webapp_private_url = f"http://{manager_ip}"

    click.echo(f"System started at:")
    click.echo(f"API: {api_private_url} (public: {api_public_url})")
    click.echo(f"Grafana: {grafana_private_url}")
    click.echo(f"Webapp: {webapp_private_url} (public: {webapp_public_url})")


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

    if service == "api":
        raise click.ClickException(
            "Scaling the API service is currently not supported."
        )

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
