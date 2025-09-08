import click

from cli.commands.contest import contest
from cli.commands.install import install
from cli.commands.system import system
from cli.config import __build_date__, __git_commit__, __version__


@click.group()
@click.version_option(
    version=(
        f"{__version__} "
        f"({__git_commit__[:8] if __git_commit__ != 'unknown' else 'unknown'}, "
        f"built {__build_date__})"
    ),
    prog_name="judge",
)
def judge():
    """Judge CLI - Contest management and automation tool."""
    pass


judge.add_command(contest)
judge.add_command(install)
judge.add_command(system)

if __name__ == "__main__":
    judge()
