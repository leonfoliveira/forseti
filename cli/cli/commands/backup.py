import os

import click

from cli.util.command_adapter import CommandAdapter
from cli.util.spinner import Spinner


@click.command()
def backup():
    command_adapter = CommandAdapter()
    spinner = Spinner("Creating backups")

    if not os.path.exists("./backups"):
        os.makedirs("./backups")

    volumes = (
        "forseti_grafana_data",
        "forseti_loki_data",
        "forseti_minio_data",
        "forseti_postgres_data",
        "forseti_prometheus_data",
        "forseti_rabbitmq_data",
    )

    spinner.start()
    try:
        for volume in volumes:
            command_adapter.run(
                [
                    "docker",
                    "run",
                    "--rm",
                    "-v",
                    f"{volume}:/data",
                    "-v",
                    "./backups:/backups",
                    "alpine",
                    "tar",
                    "-czvf",
                    f"/backups/{volume}.tar.gz",
                    "-C",
                    "/data",
                    ".",
                ]
            )
        spinner.complete()
    except Exception as e:
        spinner.fail()
        raise e
