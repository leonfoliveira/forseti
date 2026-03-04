from unittest.mock import patch, MagicMock
import pytest
from typer.testing import CliRunner

from cli.cmd import app

PACKAGE = "cli.cmd.swarm.join"


class TestSwarmJoin:
    @pytest.fixture
    def runner(self):
        return CliRunner()

    @pytest.fixture(autouse=True)
    def mock_docker_swarm(self):
        with patch(f"{PACKAGE}.DockerSwarm") as mock_docker_swarm:
            mock_swarm = mock_docker_swarm.return_value
            mock_swarm.join = MagicMock()
            yield mock_swarm

    def test_join_success(self, runner, mock_docker_swarm):
        """Test successful swarm join"""
        token = "SWMTKN-1-test-token"
        manager_addr = "192.168.1.100:2377"

        result = runner.invoke(app, [
            "swarm", "join",
            "--token", token,
            "--manager-address", manager_addr
        ])

        assert result.exit_code == 0
        assert "Node joined the swarm successfully!" in result.output
        mock_docker_swarm.join.assert_called_once_with(
            token=token, manager_address=manager_addr
        )

    def test_join_missing_token(self, runner):
        """Test join with missing token parameter"""
        result = runner.invoke(app, [
            "swarm", "join",
            "--manager-address", "192.168.1.100:2377"
        ])

        assert result.exit_code != 0
        assert "Missing option '--token'" in result.output

    def test_join_missing_manager_address(self, runner):
        """Test join with missing manager-address parameter"""
        result = runner.invoke(app, [
            "swarm", "join",
            "--token", "SWMTKN-1-test-token"
        ])

        assert result.exit_code != 0
        assert "Missing option '--manager-address'" in result.output

    def test_join_docker_exception(self, runner, mock_docker_swarm):
        """Test join when docker operation fails"""
        mock_docker_swarm.join.side_effect = Exception("Join failed")

        result = runner.invoke(app, [
            "swarm", "join",
            "--token", "SWMTKN-1-test-token",
            "--manager-address", "192.168.1.100:2377"
        ])

        assert result.exit_code != 0
        mock_docker_swarm.join.assert_called_once()
