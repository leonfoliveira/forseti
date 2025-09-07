import re
from datetime import datetime, timezone
from typing import Optional

import click
from tabulate import tabulate

from cli.util.api_adapter import ApiAdapter


@click.group()
def contest():
    pass


@contest.command(help="Create a new contest with the given slug.")
@click.argument("slug", required=True)
@click.option("--url", help="The API URL", required=False)
def create(slug: str, url: Optional[str]):
    if not re.match(r"^[a-zA-Z0-9-]+$", slug):
        raise click.BadParameter("Slug must be alphanumeric with dashes only.")

    payload = {
        "slug": slug,
        "title": "New Contest",
        "languages": ["CPP_17", "JAVA_21", "PYTHON_3_12"],
        "startAt": "2100-01-01T00:00:00.000Z",
        "endAt": "2100-01-01T01:00:00.000Z",
        "problems": [],
        "members": [],
    }
    contest = ApiAdapter(api_url=url).post("/v1/contests", json=payload)
    click.echo(contest.get("id"))


@contest.command(help="List all contests.")
@click.option("--url", help="The API URL", required=False)
def ls(url: Optional[str]):
    contests = ApiAdapter(api_url=url).get("/v1/contests/metadata")
    headers = ["ID", "Slug", "Title", "Start At", "End At", "Status"]
    table = []
    for contest in contests:
        table.append(
            [
                contest["id"],
                contest["slug"],
                contest["title"],
                contest["startAt"],
                contest["endAt"],
                _get_contest_status(contest),
            ]
        )
    table.sort(key=lambda x: x[3], reverse=True)
    click.echo(tabulate(table, headers=headers, tablefmt="grid"))


@contest.command(help="Delete a contest by ID.")
@click.argument("contest_id", required=True)
@click.option("--url", help="The API URL", required=False)
def delete(contest_id: str, url: Optional[str]):
    ApiAdapter(api_url=url).delete(f"/v1/contests/{contest_id}")


@contest.command(help="Force start a contest by ID.")
@click.argument("contest_id", required=True)
@click.option("--url", help="The API URL", required=False)
def start(contest_id: str, url: Optional[str]):
    ApiAdapter(api_url=url).put(f"/v1/contests/{contest_id}/start")


@contest.command(help="Force end a contest by ID.")
@click.argument("contest_id", required=True)
@click.option("--url", help="The API URL", required=False)
def end(contest_id: str, url: Optional[str]):
    ApiAdapter(api_url=url).put(f"/v1/contests/{contest_id}/end")


def _get_contest_status(contest):
    startAt = datetime.fromisoformat(contest["startAt"].replace("Z", "+00:00"))
    endAt = datetime.fromisoformat(contest["endAt"].replace("Z", "+00:00"))
    now = datetime.now(timezone.utc)

    if startAt > now:
        return click.style("NOT_STARTED", fg="yellow")
    elif endAt > now:
        return click.style("IN_PROGRESS", fg="green")
    else:
        return click.style("ENDED", fg="red")
