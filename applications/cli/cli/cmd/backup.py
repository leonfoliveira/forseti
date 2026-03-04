from rich.progress import Progress

from cli.composition import console, get_docker_client
from cli.config import __backups_dir__
from cli.util.theme import Messages


def backup_cmd():
    """
    Create backups of the Forseti volumes and save them to the ./backups directory.
    """
    docker_client = get_docker_client()
    volumes = (
        "forseti_grafana_data",
        "forseti_minio_data",
        "forseti_postgres_data",
        "forseti_prometheus_data",
        "forseti_rabbitmq_data",
    )

    with Progress(console=console) as progress:
        task = progress.add_task(
            Messages.progress("Creating backups..."), total=len(volumes)
        )
        for i in range(len(volumes)):
            volume = volumes[i]
            tar_cmd = f"tar -czvf /backups/{volume}.tar.gz -C /data ."

            docker_client.containers.run(
                image="alpine",
                command=tar_cmd,
                volumes={
                    volume: {"bind": "/data", "mode": "ro"},
                    __backups_dir__: {"bind": "/backups", "mode": "rw"},
                },
                remove=True,
            )
            progress.advance(task)

    console.print()
    console.print(
        Messages.success(f"Backups created successfully in {__backups_dir__}!")
    )
