from typing import Optional

import typer

from cli.composition import console
from cli.config import __build_date__, __git_commit__, __version__

from .backup import backup
from .contest import app as contest_app
from .install import install
from .stack import app as stack_app
from .swarm import app as swarm_app


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
app.add_typer(contest_app)
app.add_typer(swarm_app)
app.add_typer(stack_app)

app.command()(backup)
app.command()(install)


@app.callback()
def main(
    version: Optional[bool] = typer.Option(
        None, "--version", callback=version_callback, is_eager=True
    ),
):
    pass
