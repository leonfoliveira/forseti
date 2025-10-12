import click

from cli.commands.backup import backup
from cli.commands.contest import contest
from cli.commands.install import install
from cli.commands.swarm import swarm
from cli.commands.system import system
from cli.config import __build_date__, __git_commit__, __version__


@click.group()
@click.version_option(
    version=(
        f"{__version__} "
        f"({__git_commit__[:8] if __git_commit__ != 'unknown' else 'unknown'}, "
        f"built {__build_date__})"
    ),
    prog_name="forseti",
)
def forseti():
    """Forseti CLI - Contest management and automation tool."""
    pass


forseti.add_command(backup)
forseti.add_command(contest)
forseti.add_command(install)
forseti.add_command(swarm)
forseti.add_command(system)

if __name__ == "__main__":
    forseti()  # pragma: no cover
