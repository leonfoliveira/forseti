import configparser
import os
import tempfile
from typing import Any

import yaml
from jinja2 import Environment, FileSystemLoader

from cli.composition import command_adapter, get_docker_client
from cli.config import (
    __certs_dir__,
    __config_file__,
    __stack_name__,
    __stack_template_file__,
    __version__,
    __volumes_dir__,
)

from .docker_service import DockerService
from .docker_swarm import DockerSwarm


class DockerStack:
    def __init__(self, swarm: DockerSwarm):
        self.docker_client = get_docker_client()
        self.swarm = swarm
        self.config_file = __config_file__

        config_parser = configparser.ConfigParser()
        config_parser.read(__config_file__)
        self.config: dict[str, Any] = {
            section: dict(config_parser.items(section))
            for section in config_parser.sections()
        }

        self.config["__version__"] = __version__
        self.config["__volumes_path__"] = __volumes_dir__
        self.config["__certs_path__"] = __certs_dir__
        self.config["__root_password__"] = self.swarm.get_latest_secret("root_password")
        self.config["__db_password__"] = self.swarm.get_latest_secret("db_password")
        self.config["__redis_password__"] = self.swarm.get_latest_secret(
            "redis_password"
        )
        self.config["__minio_password__"] = self.swarm.get_latest_secret(
            "minio_password"
        )
        self.config["__rabbitmq_password__"] = self.swarm.get_latest_secret(
            "rabbitmq_password"
        )

        template_dir = os.path.dirname(__stack_template_file__)

        env = Environment(loader=FileSystemLoader(template_dir))
        template = env.get_template(os.path.basename(__stack_template_file__))
        self.stack_config = yaml.safe_load(template.render(self.config))

    @property
    def services(self) -> list[DockerService]:
        docker_services = self.docker_client.services.list(
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
        services = self.docker_client.services.list(
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
                    f"docker stack deploy --detach=true -c "
                    f"{tmp_file.name} {__stack_name__}",
                    timeout=120,
                )
            finally:
                os.unlink(tmp_file.name)

    def rm(self) -> None:
        command_adapter.run(
            f"docker stack rm {__stack_name__}",
            timeout=120,
        )
