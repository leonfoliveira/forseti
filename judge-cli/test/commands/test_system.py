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

    @pytest.fixture(autouse=True)
    def network_adapter(self):
        with patch(f"{BASE_PATH}.NetworkAdapter") as mock:
            mock.return_value.get_ip_address.return_value = "localhost"
            yield mock.return_value

    @pytest.fixture
    def runner(self):
        return CliRunner()

    def test_start(self, runner, command_adapter, network_adapter):
        network_adapter.get_ip_address.return_value = "localhost"
        result = runner.invoke(system, ["start"])
        assert result.exit_code == 0
        command_adapter.run.assert_called_once_with(
            ["docker", "stack", "deploy", "-c", "stack.yaml", "judge"],
            env={"DNS": "http://localhost"},
        )

    def test_start_with_dns(self, runner, command_adapter):
        result = runner.invoke(
            system, ["start", "--dns", "http://example.com"])
        assert result.exit_code == 0
        command_adapter.run.assert_called_once_with(
            ["docker", "stack", "deploy", "-c", "stack.yaml", "judge"],
            env={"DNS": "http://example.com"},
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
            1, "This node is not a swarm manager")
        result = runner.invoke(system, ["stop"])
        assert result.exit_code == 1
        assert "This node is not a swarm manager" in result.output

    def test_stop_not_found_in_stack(self, runner, command_adapter):
        command_adapter.run.side_effect = CommandAdapter.Error(
            1, "Error response from daemon: network k68v2trt6xqddwqzpv3n77nor not foundFailed to remove some resources from stack: judge")
        result = runner.invoke(system, ["stop"])
        assert result.exit_code == 1
        assert "System is not running" in result.output

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
            1, "This node is not a swarm manager")
        result = runner.invoke(system, ["status"])
        assert result.exit_code == 1
        assert "This node is not a swarm manager" in result.output

    def test_status_nothing_found_in_stack(self, runner, command_adapter):
        command_adapter.run.side_effect = CommandAdapter.Error(
            1, "nothing found in stack")
        result = runner.invoke(system, ["status"])
        assert result.exit_code == 1
        assert "System is not running" in result.output

    def test_status_other_error(self, runner, command_adapter):
        command_adapter.run.side_effect = CommandAdapter.Error(
            1, "Some other error")
        result = runner.invoke(system, ["status"])
        assert result.exit_code == 1

    def test_scale(self, runner, command_adapter):
        result = runner.invoke(system, ["scale", "web", "3"])
        assert result.exit_code == 0
        command_adapter.run.assert_called_once_with(
            ["docker", "service", "update", "--replicas",
                "3", "judge_web"]
        )

    def test_scale_swarm_manager_error(self, runner, command_adapter):
        command_adapter.run.side_effect = CommandAdapter.Error(
            1, "This node is not a swarm manager")
        result = runner.invoke(system, ["scale", "web", "3"])
        assert result.exit_code == 1
        assert "This node is not a swarm manager" in result.output

    def test_scale_not_found_in_stack(self, runner, command_adapter):
        command_adapter.run.side_effect = CommandAdapter.Error(
            1, "service web not found")
        result = runner.invoke(system, ["scale", "web", "3"])
        assert result.exit_code == 1
        assert "Service web not found" in result.output

    def test_scale_other_error(self, runner, command_adapter):
        command_adapter.run.side_effect = CommandAdapter.Error(
            1, "Some other error")
        result = runner.invoke(system, ["scale", "web", "3"])
        assert result.exit_code == 1
