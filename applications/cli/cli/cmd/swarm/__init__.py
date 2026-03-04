import typer

from .info import info
from .init import init
from .join import join
from .leave import leave

app = typer.Typer(
    name="swarm",
    help="Commands for managing Docker Swarm clusters.",
    no_args_is_help=True,
)

app.command()(info)
app.command()(init)
app.command()(join)
app.command()(leave)
