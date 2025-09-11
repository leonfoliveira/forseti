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

    @pytest.fixture(autouse=True)
    def spinner(self):
        with patch(f"{BASE_PATH}.Spinner") as mock:
            yield mock.return_value

    @pytest.fixture(autouse=True)
    def os(self):
        with patch(f"{BASE_PATH}.os") as mock:
            yield mock

    @pytest.fixture
    def runner(self):
        return CliRunner()

    def test_start(self, runner, command_adapter, network_adapter, os):
        network_adapter.get_ip_address.return_value = "localhost"
        command_adapter.get_cli_path.return_value = "/cli/path"
        os.path.join.side_effect = lambda *args: "/".join(args)

        result = runner.invoke(system, ["start"])
        assert result.exit_code == 0
        command_adapter.run.assert_called_once_with(
            ["docker", "stack", "deploy", "-c", "/cli/path/stack.yaml", "judge"],
            env={"API_URL": "http://localhost:8080",
                 "WEBAPP_URL": "http://localhost",
                 "SECURE_COOKIES": "false"},
        )

    def test_start_with_url(self, runner, command_adapter, os):
        command_adapter.get_cli_path.return_value = "/cli/path"
        os.path.join.side_effect = lambda *args: "/".join(args)

        result = runner.invoke(
            system, ["start", "--api-public-url", "http://api.example.com", "--webapp-public-url", "http://example.com"])
        assert result.exit_code == 0
        command_adapter.run.assert_called_once_with(
            ["docker", "stack", "deploy", "-c", "/cli/path/stack.yaml", "judge"],
            env={"API_URL": "http://api.example.com",
                 "WEBAPP_URL": "http://example.com",
                 "SECURE_COOKIES": "false"},
        )

    def test_start_swarm_manager_error(self, runner, command_adapter, spinner):
        command_adapter.run.side_effect = click.ClickException(
            "this node is not a swarm manager")
        result = runner.invoke(system, ["start"])
        assert result.exit_code == 1
        assert "This node is not a swarm manager" in result.output

    def test_start_other_error(self, runner, command_adapter, spinner):
        command_adapter.run.side_effect = click.ClickException(
            "Some other error")
        result = runner.invoke(system, ["start"])
        assert result.exit_code == 1

    def test_stop(self, runner, command_adapter):
        result = runner.invoke(system, ["stop"])
        assert result.exit_code == 0
        command_adapter.run.assert_called_once_with(
            ["docker", "stack", "rm", "judge"]
        )

    def test_stop_swarm_manager_error(self, runner, command_adapter, spinner):
        command_adapter.run.side_effect = click.ClickException(
            "This node is not a swarm manager")
        result = runner.invoke(system, ["stop"])
        assert result.exit_code == 1
        assert "This node is not a swarm manager" in result.output

    def test_stop_not_found_in_stack(self, runner, command_adapter, spinner):
        command_adapter.run.side_effect = click.ClickException(
            "Error response from daemon: network k68v2trt6xqddwqzpv3n77nor not found")
        result = runner.invoke(system, ["stop"])
        assert result.exit_code == 1
        assert "System is not running" in result.output

    def test_stop_other_error(self, runner, command_adapter, spinner):
        command_adapter.run.side_effect = click.ClickException(
            "Some other error")
        result = runner.invoke(system, ["stop"])
        assert result.exit_code == 1

    def test_status(self, runner, command_adapter):
        result = runner.invoke(system, ["status"])
        assert result.exit_code == 0
        command_adapter.run.assert_called_once_with(
            ["docker", "stack", "ps", "judge"]
        )

    def test_status_swarm_manager_error(self, runner, command_adapter):
        command_adapter.run.side_effect = click.ClickException(
            "This node is not a swarm manager")
        result = runner.invoke(system, ["status"])
        assert result.exit_code == 1
        assert "This node is not a swarm manager" in result.output

    def test_status_nothing_found_in_stack(self, runner, command_adapter):
        command_adapter.run.side_effect = click.ClickException(
            "nothing found in stack")
        result = runner.invoke(system, ["status"])
        assert result.exit_code == 1
        assert "System is not running" in result.output

    def test_status_other_error(self, runner, command_adapter):
        command_adapter.run.side_effect = click.ClickException(
            "Some other error")
        result = runner.invoke(system, ["status"])
        assert result.exit_code == 1

    def test_scale(self, runner, command_adapter):
        result = runner.invoke(system, ["scale", "web", "3"])
        assert result.exit_code == 0
        command_adapter.run.assert_called_once_with(
            ["docker", "service", "update", "--replicas",
                "3", "judge_web"]
        )

    def test_scale_swarm_manager_error(self, runner, command_adapter, spinner):
        command_adapter.run.side_effect = click.ClickException(
            "This node is not a swarm manager")
        result = runner.invoke(system, ["scale", "web", "3"])
        assert result.exit_code == 1
        assert "This node is not a swarm manager" in result.output

    def test_scale_not_found_in_stack(self, runner, command_adapter, spinner):
        command_adapter.run.side_effect = click.ClickException(
            "service web not found")
        result = runner.invoke(system, ["scale", "web", "3"])
        assert result.exit_code == 1
        assert "Service web not found" in result.output

    def test_scale_other_error(self, runner, command_adapter, spinner):
        command_adapter.run.side_effect = click.ClickException(
            "Some other error")
        result = runner.invoke(system, ["scale", "web", "3"])
        assert result.exit_code == 1

    def test_scale_api_service_not_supported(self, runner, command_adapter, spinner):
        result = runner.invoke(system, ["scale", "api", "3"])
        assert result.exit_code == 1
        assert "Scaling the API service is currently not supported." in result.output
