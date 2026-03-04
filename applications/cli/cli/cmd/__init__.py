from typing import Optional

import typer

from cli.composition import console
from cli.config import __build_date__, __git_commit__, __version__

from .backup import backup_cmd
from .contest import contest_typer
from .install import install_cmd
from .stack import stack_typer
from .swarm import swarm_typer


def version_callback(value: bool):
    if value:
        version_str = (
            f"forseti version {__version__} "
            f"({__git_commit__[:8] if __git_commit__ != 'unknown' else 'unknown'}, "
            f"built {__build_date__})"
        )
        console.print(version_str)
        raise typer.Exit()


app = typer.Typer(
    name="forseti",
    help="Forseti CLI - A command-line interface for managing Forseti resources.",
    no_args_is_help=True,
)
app.add_typer(contest_typer)
app.add_typer(swarm_typer)
app.add_typer(stack_typer)

app.command("backup")(backup_cmd)
app.command("install")(install_cmd)


@app.callback()
def main(
    version: Optional[bool] = typer.Option(
        None, "--version", callback=version_callback, is_eager=True, help="Show the version and exit."
    ),
):
    pass
