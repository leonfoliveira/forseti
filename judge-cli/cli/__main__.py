import click

from cli.commands.contests import contest


@click.group()
def judge():
    pass


judge.add_command(contest)

if __name__ == "__main__":
    judge()
