import typer

from .deploy import deploy_cmd
from .rm import rm_cmd
from .scale import scale_cmd
from .status import status_cmd

stack_typer = typer.Typer(
    name="stack",
    help="Commands for managing the Forseti stack",
)

stack_typer.command("deploy")(deploy_cmd)
stack_typer.command("rm")(rm_cmd)
stack_typer.command("scale")(scale_cmd)
stack_typer.command("status")(status_cmd)
