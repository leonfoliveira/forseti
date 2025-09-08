import pytest
from unittest.mock import patch
from click.testing import CliRunner
import click

from cli.commands.system import system
from cli.util.command_adapter import CommandAdapter

BASE_PATH = "cli.commands.system"


class TestSystemCommand:
    @pytest.fixture(autouse=True)
    def command_adapter(self):
        with patch(f"{BASE_PATH}.CommandAdapter") as mock:
            # Ensure CommandAdapter.Error is still the real exception class
            mock.Error = CommandAdapter.Error
            yield mock.return_value

    @pytest.fixture
    def runner(self):
        return CliRunner()

    def test_start(self, runner, command_adapter):
        result = runner.invoke(system, ["start"])
        assert result.exit_code == 0
        command_adapter.run.assert_called_once_with(
            ["docker", "stack", "deploy", "-c", "stack.yaml", "judge"]
        )

    def test_start_swarm_manager_error(self, runner, command_adapter):
        command_adapter.run.side_effect = CommandAdapter.Error(
            1, "this node is not a swarm manager")
        result = runner.invoke(system, ["start"])
        assert result.exit_code == 1
        assert "This node is not a swarm manager" in result.output

    def test_start_other_error(self, runner, command_adapter):
        command_adapter.run.side_effect = CommandAdapter.Error(
            1, "Some other error")
        result = runner.invoke(system, ["start"])
        assert result.exit_code == 1

    def test_stop(self, runner, command_adapter):
        result = runner.invoke(system, ["stop"])
        assert result.exit_code == 0
        command_adapter.run.assert_called_once_with(
            ["docker", "stack", "rm", "judge"]
        )

    def test_stop_swarm_manager_error(self, runner, command_adapter):
        command_adapter.run.side_effect = CommandAdapter.Error(
            1, "this node is not a swarm manager")
        result = runner.invoke(system, ["stop"])
        assert result.exit_code == 1
        assert "This node is not a swarm manager" in result.output

    def test_stop_other_error(self, runner, command_adapter):
        command_adapter.run.side_effect = CommandAdapter.Error(
            1, "Some other error")
        result = runner.invoke(system, ["stop"])
        assert result.exit_code == 1

    def test_status(self, runner, command_adapter):
        result = runner.invoke(system, ["status"])
        assert result.exit_code == 0
        command_adapter.run.assert_called_once_with(
            ["docker", "stack", "ps", "judge"]
        )

    def test_status_swarm_manager_error(self, runner, command_adapter):
        command_adapter.run.side_effect = CommandAdapter.Error(
            1, "this node is not a swarm manager")
        result = runner.invoke(system, ["status"])
        assert result.exit_code == 1
        assert "This node is not a swarm manager" in result.output

    def test_status_other_error(self, runner, command_adapter):
        command_adapter.run.side_effect = CommandAdapter.Error(
            1, "Some other error")
        result = runner.invoke(system, ["status"])
        assert result.exit_code == 1
