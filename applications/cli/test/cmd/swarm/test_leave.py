from unittest.mock import patch, MagicMock
import pytest
from typer.testing import CliRunner

from cli.cmd import app

PACKAGE = "cli.cmd.swarm.leave"


class TestSwarmLeave:
    @pytest.fixture
    def runner(self):
        return CliRunner()

    @pytest.fixture(autouse=True)
    def mock_docker_swarm(self):
        with patch(f"{PACKAGE}.DockerSwarm") as mock_docker_swarm:
            mock_swarm = mock_docker_swarm.return_value
            mock_swarm.is_active = True
            mock_swarm.leave = MagicMock()
            yield mock_swarm

    @pytest.fixture(autouse=True)
    def mock_typer_confirm(self):
        with patch(f"{PACKAGE}.typer.confirm") as mock_confirm:
            mock_confirm.return_value = True
            yield mock_confirm

    def test_leave_not_in_swarm(self, runner, mock_docker_swarm):
        """Test leave when node is not in swarm"""
        mock_docker_swarm.is_active = False
        result = runner.invoke(app, ["swarm", "leave"])

        assert result.exit_code == 1
        assert "This node is not part of a swarm" in result.output
        mock_docker_swarm.leave.assert_not_called()

    def test_leave_success(self, runner, mock_docker_swarm, mock_typer_confirm):
        """Test successful swarm leave"""
        result = runner.invoke(app, ["swarm", "leave"])

        assert result.exit_code == 0
        assert "Successfully left the swarm" in result.output
        mock_docker_swarm.leave.assert_called_once()
        mock_typer_confirm.assert_called_once()

    def test_leave_user_cancels(self, runner, mock_docker_swarm, mock_typer_confirm):
        """Test leave when user cancels confirmation"""
        mock_typer_confirm.return_value = False

        result = runner.invoke(app, ["swarm", "leave"])

        assert result.exit_code == 1  # typer.Abort() exits with code 1
        mock_docker_swarm.leave.assert_not_called()

    def test_leave_docker_exception(self, runner, mock_docker_swarm):
        """Test leave when docker operation fails"""
        mock_docker_swarm.leave.side_effect = Exception("Leave failed")

        result = runner.invoke(app, ["swarm", "leave"])

        assert result.exit_code != 0
        mock_docker_swarm.leave.assert_called_once()
