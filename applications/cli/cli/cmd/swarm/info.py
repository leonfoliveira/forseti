from rich.table import Table

from cli.composition import console
from cli.util.docker.docker_swarm import DockerSwarm
from cli.util.theme import ColorTheme


def info_cmd():
    """
    Display Docker Swarm information, including join tokens and manager address.
    """
    docker_swarm = DockerSwarm()

    state_color = "green" if docker_swarm.is_active else "red"
    console.print(
        f"Swarm State: [{state_color}]{docker_swarm.local_node_state}[/{state_color}]"
    )

    if not docker_swarm.is_active:
        return

    console.print()

    console.print(f"Manager Address: {docker_swarm.manager_address}")
    console.print(f"Worker Join Token: {docker_swarm.worker_join_token}")
    console.print(f"Manager Join Token: {docker_swarm.manager_join_token}")

    console.print()

    table = Table(title="Swarm Nodes")
    table.add_column("ID", style=ColorTheme.SERVICE_NAME.value)
    table.add_column("Hostname", style=ColorTheme.NODE_NAME.value)
    table.add_column("Address", style=ColorTheme.SECONDARY.value)
    table.add_column("Role")
    table.add_column("State")

    for node in docker_swarm.nodes:
        role_style = "yellow" if node.role == "manager" else "magenta"
        state_style = "green" if node.state == "ready" else "red"
        table.add_row(
            node.id,
            node.hostname,
            node.address,
            f"[{role_style}]{node.role}[/{role_style}]",
            f"[{state_style}]{node.state}[/{state_style}]",
        )

    console.print(table)
