import configparser
import os
from pathlib import Path

import yaml
from jinja2 import Environment, FileSystemLoader

from cli.composition import command_adapter, docker_client
from cli.config import __stack_name__

from .docker_service import DockerService
from .docker_swarm import DockerSwarm


class DockerStack:
    def __init__(self, swarm: DockerSwarm, stack_file: Path, config_file: Path):
        self.swarm = swarm
        self.stack_file = stack_file
        self.config_file = config_file

        config_parser = configparser.ConfigParser()
        config_parser.read(config_file)
        self.config = {
            section: dict(config_parser.items(section))
            for section in config_parser.sections()
        }

        template_dir = os.path.dirname(str(stack_file))
        template_name = os.path.basename(str(stack_file))

        env = Environment(loader=FileSystemLoader(template_dir))
        template = env.get_template(template_name)
        self.stack_config = yaml.safe_load(template.render(self.config))

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
        command_adapter.run(
            f"docker stack deploy --detach=true -c {self.stack_file} {__stack_name__}",
            timeout=120,
        )

    def rm(self) -> None:
        command_adapter.run(
            f"docker stack rm {__stack_name__}",
            timeout=120,
        )
