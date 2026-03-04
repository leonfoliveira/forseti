import typer

from cli.composition import console
from cli.util.docker.docker_swarm import DockerSwarm
from cli.util.theme import Messages


def leave_cmd():
    """
    Leave the current Docker Swarm cluster.
    """
    docker_swarm = DockerSwarm()

    if not docker_swarm.is_active:
        console.print(Messages.warning("This node is not part of a swarm."))
        raise typer.Exit(code=1)

    leave = typer.confirm(
        "Are you sure you want to leave the swarm? This will remove all services and secrets from this node.",
        default=False,
    )
    if not leave:
        raise typer.Abort()

    docker_swarm.leave()

    console.print()
    console.print(Messages.success("Successfully left the swarm."))
