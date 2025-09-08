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
        result = runner.invoke(system, ["start"])
        assert result.exit_code == 0
        command_adapter.run.assert_called_once_with(
            ["docker", "stack", "deploy", "-c", "stack.yaml", "judge"]
        )

    def test_stop(self, runner, command_adapter):
        result = runner.invoke(system, ["stop"])
        assert result.exit_code == 0
        command_adapter.run.assert_called_once_with(
            ["docker", "stack", "rm", "judge"]
        )

    def test_status(self, runner, command_adapter):
        result = runner.invoke(system, ["status"])
        assert result.exit_code == 0
        command_adapter.run.assert_called_once_with(
            ["docker", "stack", "ps", "judge"]
        )
