from unittest.mock import patch, MagicMock
import pytest
from typer.testing import CliRunner

from cli.cmd import app

PACKAGE = "cli.cmd.stack.deploy"


class TestStackDeploy:
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
            mock_stack.is_deployed = False
            mock_stack.deploy.return_value = None

            mock_service = MagicMock()
            mock_service.is_running = True
            mock_service.is_converged = True
            mock_stack.services = [mock_service]

            yield mock_stack

    @pytest.fixture(autouse=True)
    def mock_build_table(self):
        with patch(f"{PACKAGE}.build_table") as mock_build_table:
            mock_table = MagicMock()
            mock_table.__rich_console__ = MagicMock()
            mock_build_table.return_value = mock_table
            yield mock_build_table

    @pytest.fixture(autouse=True)
    def mock_sleep(self):
        with patch(f"{PACKAGE}.sleep") as mock_sleep:
            yield mock_sleep

    def test_deploy_not_in_swarm(self, runner, mock_docker_swarm):
        """Test deploy when node is not in swarm"""
        mock_docker_swarm.is_active = False
        result = runner.invoke(app, ["stack", "deploy", "--yes"])

        assert result.exit_code == 1
        assert "This node is not part of a swarm" in result.output

    def test_deploy_already_deployed_without_force(self, runner, mock_docker_stack):
        """Test deploy when stack is already deployed without force flag"""
        mock_docker_stack.is_deployed = True
        result = runner.invoke(app, ["stack", "deploy", "--yes"])

        assert result.exit_code == 0
        assert "is already deployed" in result.output
        mock_docker_stack.deploy.assert_not_called()

    def test_deploy_already_deployed_with_force(self, runner, mock_docker_stack):
        """Test deploy when stack is already deployed with force flag"""
        mock_docker_stack.is_deployed = True
        result = runner.invoke(app, ["stack", "deploy", "--yes", "--force"])

        assert result.exit_code == 0
        mock_docker_stack.deploy.assert_called_once()
        assert "Stack deployed successfully!" in result.output

    def test_deploy_failure(self, runner, mock_docker_stack):
        """Test deploy command failure"""
        mock_docker_stack.deploy.side_effect = Exception("Deploy failed")
        result = runner.invoke(app, ["stack", "deploy", "--yes"])

        assert result.exit_code == 1
        assert "Deployment failed: Deploy failed" in result.output
