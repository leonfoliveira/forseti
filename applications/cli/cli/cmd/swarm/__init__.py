import typer

from .info import info_cmd
from .init import init_cmd
from .join import join_cmd
from .leave import leave_cmd

swarm_typer = typer.Typer(
    name="swarm",
    help="Commands for managing Docker Swarm clusters.",
    no_args_is_help=True,
)

swarm_typer.command("info")(info_cmd)
swarm_typer.command("init")(init_cmd)
swarm_typer.command("join")(join_cmd)
swarm_typer.command("leave")(leave_cmd)
