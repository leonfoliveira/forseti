import pytest
from unittest.mock import patch, MagicMock
from click.testing import CliRunner

from cli.commands.install import install

BASE_PATH = "cli.commands.install"


class TestInstallCommand:
    """Test cases for the install command functionality."""

    @pytest.fixture(autouse=True)
    def command_adapter(self):
        with patch(f"{BASE_PATH}.CommandAdapter") as mock:
            from cli.util.command_adapter import CommandAdapter
            mock.Error = CommandAdapter.Error
            yield mock.return_value

    @pytest.fixture(autouse=True)
    def input_adapter(self):
        with patch(f"{BASE_PATH}.InputAdapter") as mock:
            yield mock.return_value

    @pytest.fixture(autouse=True)
    def os(self):
        with patch(f"{BASE_PATH}.os") as mock:
            yield mock

    @pytest.fixture(autouse=True)
    def subprocess(self):
        with patch(f"{BASE_PATH}.subprocess") as mock:
            # Mock the subprocess.run call in _setup_swarm
            mock.run.return_value.stdout.strip.return_value = "inactive"
            mock.DEVNULL = MagicMock()
            yield mock

    @pytest.fixture
    def runner(self):
        return CliRunner()

    def test_install(self, runner, command_adapter, input_adapter, os, subprocess):
        """Test successful installation with custom stack file."""
        # Setup mocks - correct password order based on the actual implementation
        input_adapter.password.side_effect = [
            "db_password",      # DB password
            "root_password",    # Root password
            "grafana_admin_password",  # Grafana admin password
            "jwt_secret",       # JWT secret
        ]
        input_adapter.checkbox.return_value = [
            "gcc:15.1.0",
            "eclipse-temurin:21-jdk-alpine",
            "python:3.12.3-alpine",
        ]
        os.path.exists.return_value = True

        # Fix the command invocation
        result = runner.invoke(install)

        # Verify the command succeeded
        assert result.exit_code == 0
        assert "Judge system installed successfully." in result.output

        # Verify that the required methods were called
        assert input_adapter.password.call_count == 4
        assert input_adapter.checkbox.call_count == 1

        # Verify command adapter was called for Docker operations
        assert command_adapter.run.call_count > 0

    def test_install_no_docker(self, runner, command_adapter, input_adapter, os, subprocess):
        # Simulate Docker not being installed by raising an error
        from cli.util.command_adapter import CommandAdapter
        command_adapter.run.side_effect = CommandAdapter.Error(
            1, "docker: command not found")

        result = runner.invoke(install)

        assert result.exit_code == 1
        assert "Docker is not installed or not found in PATH." in result.output

    def test_install_with_empty_jwt_secret(self, runner, command_adapter, input_adapter, os, subprocess):
        """Test automatic JWT secret generation when user provides empty input."""
        # Test JWT secret generation when empty password is provided
        input_adapter.password.side_effect = [
            "db_password",
            "root_password",
            "grafana_admin_password",
            "",  # Empty JWT secret should trigger random generation
        ]
        input_adapter.checkbox.return_value = ["python:3.12.3-alpine"]
        os.path.exists.return_value = True

        result = runner.invoke(install)

        assert result.exit_code == 0
        # Verify a random JWT secret was generated and used
        docker_secret_calls = [call for call in command_adapter.run.call_args_list
                               if "docker" in call[0][0] and "secret" in call[0][0]]
        # Should have calls for creating jwt_secret
        jwt_secret_calls = [call for call in docker_secret_calls
                            if "jwt_secret" in call[0][0]]
        assert len(jwt_secret_calls) > 0
