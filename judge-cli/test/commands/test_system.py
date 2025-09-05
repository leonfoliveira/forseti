import pytest
from unittest.mock import patch
from click.testing import CliRunner

from cli.commands.system import system

BASE_PATH = "cli.commands.system"


class TestSystemCommand:
    @pytest.fixture(autouse=True)
    def command_adapter(self):
        with patch(f"{BASE_PATH}.CommandAdapter") as mock:
            yield mock.return_value

    @pytest.fixture
    def runner(self):
        return CliRunner()

    def test_start(self, runner, command_adapter):
        result = runner.invoke(
            system, ["start", "--stack", "custom_stack.yaml",
                     "--stack-name", "test_stack"]
        )
        assert result.exit_code == 0
        command_adapter.run.assert_called_once_with(
            ["docker", "stack", "deploy", "-c", "custom_stack.yaml", "test_stack"]
        )

    def test_start_default_values(self, runner, command_adapter):
        result = runner.invoke(system, ["start"])
        assert result.exit_code == 0
        command_adapter.run.assert_called_once_with(
            ["docker", "stack", "deploy", "-c", "stack.yaml", "judge"]
        )

    def test_stop(self, runner, command_adapter):
        result = runner.invoke(
            system, ["stop", "--stack-name", "test_stack"])
        assert result.exit_code == 0
        command_adapter.run.assert_called_once_with(
            ["docker", "stack", "rm", "test_stack"]
        )

    def test_stop_default_stack_name(self, runner, command_adapter):
        result = runner.invoke(system, ["stop"])
        assert result.exit_code == 0
        command_adapter.run.assert_called_once_with(
            ["docker", "stack", "rm", "judge"]
        )

    def test_status(self, runner, command_adapter):
        result = runner.invoke(
            system, ["status", "--stack-name", "test_stack"])
        assert result.exit_code == 0
        command_adapter.run.assert_called_once_with(
            ["docker", "stack", "ps", "test_stack"]
        )

    def test_status_default_stack_name(self, runner, command_adapter):
        result = runner.invoke(system, ["status"])
        assert result.exit_code == 0
        command_adapter.run.assert_called_once_with(
            ["docker", "stack", "ps", "judge"]
        )
