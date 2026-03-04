import typer

from .create import create
from .delete import delete
from .ls import ls

app = typer.Typer(
    name="contest",
    help="Commands for managing contests.",
    no_args_is_help=True,
)

app.command()(create)
app.command()(delete)
app.command()(ls)
