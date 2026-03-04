import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Annotated

import typer
from rich.progress import Progress

from cli.composition import command_adapter, console, docker_client
from cli.config import (
    __config_file__,
    __sandboxes_dir__,
    __stack_template_file__,
    __version__,
)
from cli.util.docker.docker_stack import DockerStack
from cli.util.docker.docker_swarm import DockerSwarm
from cli.util.theme import Messages


def install_cmd(
    sandboxes: Annotated[
        list[str],
        typer.Option(
            help="List of sandboxes to build",
            default_factory=lambda: ["cpp17", "java21", "python312"],
        ),
    ],
    stack_template_file: Annotated[
        Path, typer.Option(help="Path to the stack template file.", exists=True)
    ] = Path(__stack_template_file__),
    config_file: Annotated[
        Path, typer.Option(help="Path to the configuration file.", exists=True)
    ] = Path(__config_file__),
    sandboxes_dir: Annotated[
        Path,
        typer.Option(help="Directory containing sandbox Dockerfiles.", exists=True),
    ] = Path(__sandboxes_dir__),
):
    """
    Install Forseti dependencies and sandboxes.
    """
    swarm = DockerSwarm()
    stack = DockerStack(
        swarm=swarm, stack_template_file=stack_template_file, config_file=config_file
    )

    _install_certificates(stack)
    _build_sandboxes(sandboxes_dir, sandboxes)
    _pull_stack_images(stack)

    console.print()
    console.print(Messages.success("Installation complete!"))


def _install_certificates(stack: DockerStack):
    folder = "./certs"

    with Progress(console=console) as progress:
        task = progress.add_task(
            Messages.progress("Generating TLS certificates..."), total=3
        )

        if not os.path.exists(folder):
            os.makedirs(folder)
        progress.advance(task)

        mkcert_cmd = (
            f"mkcert -cert-file {folder}/cert.pem -key-file {folder}/key.pem "
            f"*.{stack.config['global']['domain']} localhost 127.0.0.1 ::1"
        )
        result = command_adapter.run(
            mkcert_cmd,
            missing_command_help=(
                "Make sure mkcert is installed: "
                "https://github.com/FiloSottile/mkcert"
            ),
        )
        if not result.success:
            console.print(
                Messages.error(
                    "Failed to generate TLS certificates. Please ensure "
                    "mkcert is installed and working correctly."
                )
            )
            raise typer.Exit(code=1)
        progress.advance(task)

        ca_copy_cmd = f"cp $(mkcert -CAROOT)/rootCA.pem {folder}/rootCA.pem"
        result = command_adapter.run(ca_copy_cmd)
        if not result.success:
            console.print(
                Messages.error(
                    "Failed to copy CA certificate. Please ensure "
                    "mkcert is installed and working correctly."
                )
            )
            raise typer.Exit(code=1)
        progress.advance(task)


def _build_sandboxes(sandbox_dir: Path, sandboxes: list[str]):
    with Progress(console=console) as progress:
        task = progress.add_task(
            Messages.progress("Building sandboxes..."), total=len(sandboxes)
        )
        for i in range(len(sandboxes)):
            sandbox = sandboxes[i]
            dockerfile = f"{sandbox}.Dockerfile"
            docker_client.images.build(
                path=str(sandbox_dir),
                dockerfile=dockerfile,
                tag=f"forseti-sb-{sandbox}:{__version__}",
            )
            progress.advance(task)


def _pull_stack_images(stack: DockerStack):
    services = stack.stack_config.get("services", {})
    service_configs = list(services.values())

    images = set(
        filter(
            None,
            [service.get("image") for service in service_configs if "image" in service],
        )
    )

    def pull_image(image_name):
        try:
            docker_client.images.pull(image_name)
            return True, image_name, None
        except Exception as e:
            return False, image_name, str(e)

    executor = ThreadPoolExecutor(max_workers=4)
    future_to_image = {executor.submit(pull_image, image): image for image in images}

    with Progress(console=console) as progress:
        task = progress.add_task(
            Messages.progress("Pulling stack images..."), total=len(images)
        )
        with ThreadPoolExecutor(max_workers=4) as executor:
            future_to_image = {executor.submit(pull_image, img): img for img in images}
            for future in as_completed(future_to_image):
                success, image_name, error = future.result()
                if not success:
                    progress.console.print(
                        Messages.error(f"Failed to pull {image_name}: {error}")
                    )
                    for f in future_to_image.keys():
                        f.cancel()
                    executor.shutdown(wait=False, cancel_futures=True)
                    raise typer.Exit(code=1)
                progress.advance(task)
