import typer

from .create import create_cmd
from .delete import delete_cmd
from .ls import ls_cmd

contest_typer = typer.Typer(
    name="contest",
    help="Commands for managing contests.",
    no_args_is_help=True,
)

contest_typer.command("create")(create_cmd)
contest_typer.command("delete")(delete_cmd)
contest_typer.command("ls")(ls_cmd)
