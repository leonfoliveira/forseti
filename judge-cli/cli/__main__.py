import click

from cli.commands.contest import contest
from cli.commands.install import install
from cli.commands.system import system

try:
    from cli._version import __build_date__, __git_commit__, __version__
except ImportError:
    __version__ = "dev"
    __git_commit__ = "unknown"
    __build_date__ = "unknown"


@click.group()
@click.version_option(
    version=f"{__version__} ({__git_commit__[:8] if __git_commit__ != 'unknown' else 'unknown'}, built {__build_date__})",
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
