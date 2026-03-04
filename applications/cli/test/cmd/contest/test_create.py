from unittest.mock import patch, MagicMock
import pytest
from typer.testing import CliRunner

from cli.cmd import app

PACKAGE = "cli.cmd.contest.create"


class TestContestCreate:
    @pytest.fixture
    def runner(self):
        return CliRunner()

    @pytest.fixture(autouse=True)
    def mock_docker_swarm(self):
        with patch(f"{PACKAGE}.DockerSwarm") as mock_docker_swarm:
            mock_swarm = mock_docker_swarm.return_value
            yield mock_swarm

    @pytest.fixture(autouse=True)
    def mock_docker_stack(self):
        with patch(f"{PACKAGE}.DockerStack") as mock_docker_stack:
            mock_stack = mock_docker_stack.return_value
            yield mock_stack

    @pytest.fixture(autouse=True)
    def mock_api_adapter(self):
        with patch(f"{PACKAGE}.ApiAdapter") as mock_api_adapter:
            mock_adapter = mock_api_adapter.return_value
            yield mock_adapter

    def test_swarm_not_active(self, runner, mock_docker_swarm):
        mock_docker_swarm.is_active = False
        result = runner.invoke(app, ["contest", "create", "test-contest"])
        assert result.exit_code == 1
        assert "This node is not part of a swarm." in result.output

    def test_stack_not_deployed(self, runner, mock_docker_swarm, mock_docker_stack):
        mock_docker_swarm.is_active = True
        mock_docker_stack.is_deployed = False
        result = runner.invoke(app, ["contest", "create", "test-contest"])
        assert result.exit_code == 0
        assert "Stack is not deployed." in result.output

    def test_create_contest_success(self, runner, mock_docker_swarm, mock_docker_stack, mock_api_adapter):
        mock_docker_swarm.is_active = True
        mock_docker_stack.is_deployed = True

        mock_api_adapter.create_contest.return_value = {"id": "12345"}

        result = runner.invoke(app, ["contest", "create", "test-contest"])
        assert result.exit_code == 0
        assert "Contest 'test-contest' created successfully with id: 12345!" in result.output

    def test_create_contest_failure(self, runner, mock_docker_swarm, mock_docker_stack, mock_api_adapter):
        mock_docker_swarm.is_active = True
        mock_docker_stack.is_deployed = True

        mock_api_adapter.create_contest.side_effect = Exception("API error")

        result = runner.invoke(app, ["contest", "create", "test-contest"])
        assert result.exit_code == 1
        assert "Failed to create contest: API error" in result.output
