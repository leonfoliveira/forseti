from unittest.mock import patch, MagicMock
import pytest
import configparser
from pathlib import Path

from cli.util.docker.docker_stack import DockerStack

PACKAGE = "cli.util.docker.docker_stack"


class TestDockerStack:
    @pytest.fixture
    def mock_swarm(self):
        return MagicMock()

    @pytest.fixture
    def mock_stack_file(self):
        return Path("/test/stack.yaml")

    @pytest.fixture
    def mock_config_file(self):
        return Path("/test/config.ini")

    @pytest.fixture
    def mock_config_parser(self):
        parser = MagicMock()
        parser.sections.return_value = ["global", "database"]
        parser.items.side_effect = lambda section: {
            "global": [("domain", "example.com"), ("https", "true")],
            "database": [("host", "localhost"), ("port", "5432")]
        }.get(section, [])
        return parser

    @pytest.fixture
    def mock_stack_config(self):
        return {
            "services": {
                "api": {
                    "image": "forseti/api:latest",
                    "deploy": {
                        "labels": []
                    }
                },
                "webapp": {
                    "image": "forseti/webapp:latest",
                    "deploy": {
                        "labels": []
                    }
                },
                "worker": {
                    "image": "forseti/worker:latest",
                    "deploy": {
                        "labels": ["type=job"]
                    }
                }
            }
        }

    @pytest.fixture(autouse=True)
    def mock_dependencies(self, mock_config_parser, mock_stack_config):
        with patch(f"{PACKAGE}.configparser.ConfigParser") as mock_config_class, \
                patch(f"{PACKAGE}.Environment") as mock_env_class, \
                patch(f"{PACKAGE}.yaml.safe_load") as mock_yaml_load, \
                patch(f"{PACKAGE}.os.path.dirname") as mock_dirname, \
                patch(f"{PACKAGE}.os.path.basename") as mock_basename, \
                patch(f"{PACKAGE}.docker_client") as mock_docker_client, \
                patch(f"{PACKAGE}.command_adapter") as mock_command_adapter:

            # Setup config parser
            mock_config_class.return_value = mock_config_parser

            # Setup jinja environment and template
            mock_env = MagicMock()
            mock_template = MagicMock()
            mock_template.render.return_value = "rendered_yaml"
            mock_env.get_template.return_value = mock_template
            mock_env_class.return_value = mock_env

            # Setup yaml loading
            mock_yaml_load.return_value = mock_stack_config

            # Setup path operations
            mock_dirname.return_value = "/test"
            mock_basename.return_value = "stack.yaml"

            # Setup docker client
            mock_docker_client.services.list.return_value = []

            # Setup command adapter
            mock_command_adapter.run = MagicMock()

            yield {
                "config_parser": mock_config_parser,
                "env": mock_env,
                "template": mock_template,
                "yaml_load": mock_yaml_load,
                "docker_client": mock_docker_client,
                "command_adapter": mock_command_adapter
            }

    def test_init(self, mock_swarm, mock_stack_file, mock_config_file, mock_dependencies):
        """Test DockerStack initialization"""
        stack = DockerStack(mock_swarm, mock_stack_file, mock_config_file)

        assert stack.swarm == mock_swarm
        assert stack.stack_file == mock_stack_file
        assert stack.config_file == mock_config_file

        # Verify config parsing
        mock_dependencies["config_parser"].read.assert_called_once_with(
            mock_config_file)

        # Verify template rendering
        mock_dependencies["template"].render.assert_called_once()
        mock_dependencies["yaml_load"].assert_called_once_with("rendered_yaml")

    def test_config_parsing(self, mock_swarm, mock_stack_file, mock_config_file, mock_dependencies):
        """Test config file parsing"""
        stack = DockerStack(mock_swarm, mock_stack_file, mock_config_file)

        expected_config = {
            "global": {"domain": "example.com", "https": "true"},
            "database": {"host": "localhost", "port": "5432"}
        }

        assert stack.config == expected_config

    def test_template_rendering(self, mock_swarm, mock_stack_file, mock_config_file, mock_dependencies):
        """Test template rendering with config"""
        stack = DockerStack(mock_swarm, mock_stack_file, mock_config_file)

        # Verify template was rendered with config
        expected_config = {
            "global": {"domain": "example.com", "https": "true"},
            "database": {"host": "localhost", "port": "5432"}
        }
        mock_dependencies["template"].render.assert_called_once_with(
            expected_config)

    @patch(f"{PACKAGE}.DockerService")
    def test_services_property(self, mock_docker_service, mock_swarm, mock_stack_file,
                               mock_config_file, mock_dependencies):
        """Test services property"""
        # Mock docker services
        mock_docker_service1 = MagicMock()
        mock_docker_service1.name = "forseti_api"
        mock_docker_service2 = MagicMock()
        mock_docker_service2.name = "forseti_webapp"

        mock_dependencies["docker_client"].services.list.return_value = [
            mock_docker_service1, mock_docker_service2
        ]

        mock_docker_service.return_value = "mock_service"

        stack = DockerStack(mock_swarm, mock_stack_file, mock_config_file)

        services = stack.services

        # Should create 2 services (excluding job type)
        assert len(services) == 2
        assert all(service == "mock_service" for service in services)

        # Verify docker services were queried with correct filter
        mock_dependencies["docker_client"].services.list.assert_called_with(
            filters={"label": "com.docker.stack.namespace=forseti"}
        )

    @patch(f"{PACKAGE}.DockerService")
    def test_services_excludes_job_type(self, mock_docker_service, mock_swarm, mock_stack_file,
                                        mock_config_file, mock_dependencies):
        """Test services property excludes job type services"""
        mock_docker_service.return_value = "mock_service"

        stack = DockerStack(mock_swarm, mock_stack_file, mock_config_file)

        services = stack.services

        # Should only create 2 services, excluding the worker with type=job label
        assert len(services) == 2

        # Verify DockerService was called for non-job services
        service_calls = mock_docker_service.call_args_list
        service_names = [call[0][2]
                         for call in service_calls]  # Third argument is name

        assert "api" in service_names
        assert "webapp" in service_names
        assert "worker" not in service_names  # Should be excluded

    def test_is_deployed_true(self, mock_swarm, mock_stack_file, mock_config_file, mock_dependencies):
        """Test is_deployed when services exist"""
        mock_dependencies["docker_client"].services.list.return_value = [
            MagicMock()]

        stack = DockerStack(mock_swarm, mock_stack_file, mock_config_file)

        assert stack.is_deployed is True

    def test_is_deployed_false(self, mock_swarm, mock_stack_file, mock_config_file, mock_dependencies):
        """Test is_deployed when no services exist"""
        mock_dependencies["docker_client"].services.list.return_value = []

        stack = DockerStack(mock_swarm, mock_stack_file, mock_config_file)

        assert stack.is_deployed is False

    def test_deploy(self, mock_swarm, mock_stack_file, mock_config_file, mock_dependencies):
        """Test deploy method"""
        stack = DockerStack(mock_swarm, mock_stack_file, mock_config_file)

        stack.deploy()

        mock_dependencies["command_adapter"].run.assert_called_once_with(
            f"docker stack deploy --detach=true -c {mock_stack_file} forseti",
            timeout=120
        )

    def test_rm(self, mock_swarm, mock_stack_file, mock_config_file, mock_dependencies):
        """Test rm method"""
        stack = DockerStack(mock_swarm, mock_stack_file, mock_config_file)

        stack.rm()

        mock_dependencies["command_adapter"].run.assert_called_once_with(
            "docker stack rm forseti",
            timeout=120
        )

    def test_deploy_command_failure(self, mock_swarm, mock_stack_file, mock_config_file, mock_dependencies):
        """Test deploy method when command fails"""
        mock_dependencies["command_adapter"].run.side_effect = Exception(
            "Deploy failed")

        stack = DockerStack(mock_swarm, mock_stack_file, mock_config_file)

        with pytest.raises(Exception, match="Deploy failed"):
            stack.deploy()

    def test_rm_command_failure(self, mock_swarm, mock_stack_file, mock_config_file, mock_dependencies):
        """Test rm method when command fails"""
        mock_dependencies["command_adapter"].run.side_effect = Exception(
            "Remove failed")

        stack = DockerStack(mock_swarm, mock_stack_file, mock_config_file)

        with pytest.raises(Exception, match="Remove failed"):
            stack.rm()

    def test_different_stack_names(self, mock_swarm, mock_stack_file, mock_config_file, mock_dependencies):
        """Test with different stack names"""
        with patch(f"{PACKAGE}.__stack_name__", "custom_stack"):
            stack = DockerStack(mock_swarm, mock_stack_file, mock_config_file)

            stack.deploy()

            mock_dependencies["command_adapter"].run.assert_called_with(
                f"docker stack deploy --detach=true -c {mock_stack_file} custom_stack",
                timeout=120
            )

    def test_path_operations(self, mock_swarm, mock_dependencies):
        """Test path operations for template loading"""
        stack_file = Path("/custom/path/custom-stack.yaml")
        config_file = Path("/config/custom.ini")

        with patch(f"{PACKAGE}.os.path.dirname") as mock_dirname, \
                patch(f"{PACKAGE}.os.path.basename") as mock_basename:

            mock_dirname.return_value = "/custom/path"
            mock_basename.return_value = "custom-stack.yaml"

            stack = DockerStack(mock_swarm, stack_file, config_file)

            mock_dirname.assert_called_once_with(str(stack_file))
            mock_basename.assert_called_once_with(str(stack_file))

    def test_empty_services_config(self, mock_swarm, mock_stack_file, mock_config_file, mock_dependencies):
        """Test behavior with empty services configuration"""
        mock_dependencies["yaml_load"].return_value = {}

        stack = DockerStack(mock_swarm, mock_stack_file, mock_config_file)

        # Should handle empty services gracefully
        assert len(stack.services) == 0

    def test_services_with_no_deploy_section(self, mock_swarm, mock_stack_file, mock_config_file, mock_dependencies):
        """Test services without deploy section"""
        stack_config = {
            "services": {
                "simple_service": {
                    "image": "nginx:latest"
                    # No deploy section
                }
            }
        }
        mock_dependencies["yaml_load"].return_value = stack_config

        with patch(f"{PACKAGE}.DockerService") as mock_docker_service:
            mock_docker_service.return_value = "mock_service"

            stack = DockerStack(mock_swarm, mock_stack_file, mock_config_file)

            # Should still create service even without deploy section
            services = stack.services
            assert len(services) == 1

    def test_config_file_with_no_sections(self, mock_swarm, mock_stack_file, mock_config_file, mock_dependencies):
        """Test config file with no sections"""
        mock_dependencies["config_parser"].sections.return_value = []

        stack = DockerStack(mock_swarm, mock_stack_file, mock_config_file)

        # Should handle empty config gracefully
        assert stack.config == {}

    def test_template_render_error(self, mock_swarm, mock_stack_file, mock_config_file, mock_dependencies):
        """Test template rendering error"""
        mock_dependencies["template"].render.side_effect = Exception(
            "Template error")

        with pytest.raises(Exception, match="Template error"):
            DockerStack(mock_swarm, mock_stack_file, mock_config_file)

    def test_yaml_parse_error(self, mock_swarm, mock_stack_file, mock_config_file, mock_dependencies):
        """Test YAML parsing error"""
        mock_dependencies["yaml_load"].side_effect = Exception("YAML error")

        with pytest.raises(Exception, match="YAML error"):
            DockerStack(mock_swarm, mock_stack_file, mock_config_file)
