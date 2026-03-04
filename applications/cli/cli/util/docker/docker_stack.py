import configparser
import os
import tempfile
from pathlib import Path
from typing import Any

import yaml
from jinja2 import Environment, FileSystemLoader

from cli.composition import command_adapter, docker_client
from cli.config import __config_file__, __stack_name__, __stack_template_file__

from .docker_service import DockerService
from .docker_swarm import DockerSwarm


class DockerStack:
    def __init__(self, swarm: DockerSwarm):
        self.swarm = swarm
        self.stack_template_file = __stack_template_file__
        self.config_file = __config_file__

        config_parser = configparser.ConfigParser()
        config_parser.read(__config_file__)
        self.config: dict[str, Any] = {
            section: dict(config_parser.items(section))
            for section in config_parser.sections()
        }

        # Add absolute paths for volumes and certs to template context
        cli_dir = os.path.dirname(str(__stack_template_file__))
        volumes_dir = os.path.join(os.path.dirname(cli_dir), "volumes")
        certs_dir = os.path.join(cli_dir, "certs")

        template_context = dict(self.config)
        template_context["__volumes_path__"] = volumes_dir
        template_context["__certs_path__"] = certs_dir

        template_dir = os.path.dirname(str(__stack_template_file__))
        template_name = os.path.basename(str(__stack_template_file__))

        env = Environment(loader=FileSystemLoader(template_dir))
        template = env.get_template(template_name)
        self.stack_config = yaml.safe_load(template.render(template_context))

    @property
    def services(self) -> list[DockerService]:
        docker_services = docker_client.services.list(
            filters={"label": f"com.docker.stack.namespace={__stack_name__}"}
        )
        docker_services_map = {}
        for service in docker_services:
            service_name = service.name.replace(f"{__stack_name__}_", "")
            docker_services_map[service_name] = service

        service_configs = self.stack_config.get("services", {})
        return [
            DockerService(self.swarm, self, name, config, docker_services_map.get(name))
            for name, config in service_configs.items()
            if not any(
                label == "type=job"
                for label in config.get("deploy", {}).get("labels", [])
            )
        ]

    @property
    def is_deployed(self) -> bool:
        services = docker_client.services.list(
            filters={"label": f"com.docker.stack.namespace={__stack_name__}"}
        )
        return len(services) > 0

    def deploy(self) -> None:
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".yaml", delete=False
        ) as tmp_file:
            yaml.safe_dump(self.stack_config, tmp_file, default_flow_style=False)
            try:
                command_adapter.run(
                    f"docker stack deploy --detach=true -c {tmp_file.name} {__stack_name__}",
                    timeout=120,
                )
            finally:
                os.unlink(tmp_file.name)

    def rm(self) -> None:
        command_adapter.run(
            f"docker stack rm {__stack_name__}",
            timeout=120,
        )
