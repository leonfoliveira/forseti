from unittest.mock import patch, MagicMock
import pytest
from typer.testing import CliRunner

from cli.cmd import app

PACKAGE = "cli.cmd.stack.scale"


class TestStackScale:
    @pytest.fixture
    def runner(self):
        return CliRunner()

    @pytest.fixture(autouse=True)
    def mock_docker_swarm(self):
        with patch(f"{PACKAGE}.DockerSwarm") as mock_docker_swarm:
            mock_swarm = mock_docker_swarm.return_value
            mock_swarm.is_active = True
            yield mock_swarm

    @pytest.fixture(autouse=True)
    def mock_docker_stack(self):
        with patch(f"{PACKAGE}.DockerStack") as mock_docker_stack:
            mock_stack = mock_docker_stack.return_value
            mock_stack.is_deployed = True

            # Mock service
            mock_service = MagicMock()
            mock_service.name = "test_service"
            mock_service.scale.return_value = None
            mock_service.running_replicas = 3
            mock_service.is_converged = True
            mock_stack.services = [mock_service]

            yield mock_stack

    @pytest.fixture(autouse=True)
    def mock_build_table(self):
        with patch(f"{PACKAGE}.build_table") as mock_build_table:
            # Return something Rich can render
            mock_table = MagicMock()
            mock_table.__rich_console__ = MagicMock()
            mock_build_table.return_value = mock_table
            yield mock_build_table

    @pytest.fixture(autouse=True)
    def mock_sleep(self):
        with patch(f"{PACKAGE}.sleep") as mock_sleep:
            yield mock_sleep

    def test_scale_not_in_swarm(self, runner, mock_docker_swarm):
        """Test scale when node is not in swarm"""
        mock_docker_swarm.is_active = False
        result = runner.invoke(
            app, ["stack", "scale", "test_service", "3", "--yes"])

        assert result.exit_code == 1
        assert "This node is not part of a swarm" in result.output

    def test_scale_stack_not_deployed(self, runner, mock_docker_stack):
        """Test scale when stack is not deployed"""
        mock_docker_stack.is_deployed = False
        result = runner.invoke(
            app, ["stack", "scale", "test_service", "3", "--yes"])

        assert result.exit_code == 1
        assert "Stack is not deployed" in result.output

    def test_scale_service_not_found(self, runner, mock_docker_stack):
        """Test scale when service is not found"""
        mock_docker_stack.services = []  # No services
        result = runner.invoke(
            app, ["stack", "scale", "nonexistent_service", "3", "--yes"])

        assert result.exit_code == 1
        assert "not found in stack" in result.output

    def test_scale_failure(self, runner, mock_docker_stack):
        """Test scale command failure"""
        mock_docker_stack.services[0].scale.side_effect = Exception(
            "Scale failed")
        result = runner.invoke(
            app, ["stack", "scale", "test_service", "3", "--yes"])

        assert result.exit_code == 1
        assert "Failed to scale service: Scale failed" in result.output

    def test_scale_confirmation_abort(self, runner):
        """Test scale command when user aborts confirmation"""
        result = runner.invoke(
            app, ["stack", "scale", "test_service", "3"], input="n\n")

        assert result.exit_code == 1  # typer.Abort() exits with code 1
