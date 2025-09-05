import click

from cli.commands.contest import contest
from cli.commands.install import install
from cli.commands.start import start
from cli.commands.status import status
from cli.commands.stop import stop


@click.group()
def judge():
    pass


judge.add_command(contest)
judge.add_command(install)
judge.add_command(start)
judge.add_command(status)
judge.add_command(stop)

if __name__ == "__main__":
    judge()
