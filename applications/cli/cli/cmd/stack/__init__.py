import typer

from .deploy import deploy
from .rm import rm
from .scale import scale
from .status import status

app = typer.Typer(
    name="stack",
    help="Commands for managing the Forseti stack",
)

app.command()(deploy)
app.command()(rm)
app.command()(scale)
app.command()(status)
