from unittest.mock import patch, PropertyMock, MagicMock
import pytest
from typer.testing import CliRunner

from cli.cmd import app

PACKAGE = "cli.cmd.stack.rm"


class TestStackRm:
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
            mock_stack.rm.return_value = None
            yield mock_stack

    def test_rm_success(self, runner, mock_docker_stack):
        """Test successful stack removal with --yes flag"""
        result = runner.invoke(app, ["stack", "rm", "--yes"])
        print(f"Exit code: {result.exit_code}")
        print(f"Output: {result.output}")

        assert result.exit_code == 0
        mock_docker_stack.rm.assert_called_once()
        assert "Stack removed successfully!" in result.output

    def test_rm_not_in_swarm(self, runner, mock_docker_swarm):
        """Test rm when node is not in swarm"""
        mock_docker_swarm.is_active = False
        result = runner.invoke(app, ["stack", "rm", "--yes"])
        print(f"Exit code: {result.exit_code}")
        print(f"Output: {result.output}")

        assert result.exit_code == 1
        assert "This node is not part of a swarm" in result.output

    def test_rm_not_deployed(self, runner, mock_docker_stack):
        """Test rm when stack is not deployed"""
        mock_docker_stack.is_deployed = False
        result = runner.invoke(app, ["stack", "rm", "--yes"])

        assert result.exit_code == 0
        assert "Stack is not deployed" in result.output
        mock_docker_stack.rm.assert_not_called()

    def test_rm_confirmation_abort(self, runner):
        """Test rm command when user aborts confirmation"""
        result = runner.invoke(app, ["stack", "rm"], input="n\n")
        print(f"Exit code: {result.exit_code}")
        print(f"Output: {result.output}")
