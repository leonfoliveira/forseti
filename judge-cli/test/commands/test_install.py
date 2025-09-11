import pytest
from unittest.mock import patch
from click.testing import CliRunner
import click

from cli.commands.install import install

BASE_PATH = "cli.commands.install"


class TestInstallCommand:
    """Test cases for the install command functionality."""

    @pytest.fixture(autouse=True)
    def command_adapter(self):
        with patch(f"{BASE_PATH}.CommandAdapter") as mock:
            from cli.util.command_adapter import CommandAdapter
            mock.Error = CommandAdapter.Error
            yield mock.return_value

    @pytest.fixture(autouse=True)
    def os(self):
        with patch(f"{BASE_PATH}.os") as mock:
            yield mock

    @pytest.fixture(autouse=True)
    def spinner(self):
        with patch(f"{BASE_PATH}.Spinner") as mock:
            yield mock.return_value

    @pytest.fixture
    def runner(self):
        return CliRunner()

    def test_install(self, runner, command_adapter, os, spinner):
        """Test successful installation."""
        os.path.join.side_effect = lambda *args: "/".join(args)
        command_adapter.get_cli_path.return_value = "/cli/path"

        result = runner.invoke(install)

        # Verify the command succeeded
        assert result.exit_code == 0
        assert "Installation completed successfully." in result.output

        # Verify command adapter was called for Docker operations
        assert command_adapter.run.call_count > 0

        # Verify docker --version was called first
        command_adapter.run.assert_any_call(["docker", "--version"])

    def test_install_custom_sandboxes(self, runner, command_adapter, os, spinner):
        """Test installation with custom sandboxes."""
        os.path.join.side_effect = lambda *args: "/".join(args)
        command_adapter.get_cli_path.return_value = "/cli/path"

        result = runner.invoke(
            install, ["--sandboxes", "cpp17", "--sandboxes", "java21"])

        assert result.exit_code == 0
        assert "Installation completed successfully." in result.output

    def test_install_custom_stack(self, runner, command_adapter, os, spinner):
        """Test installation with custom stack file."""
        os.path.join.side_effect = lambda *args: "/".join(args)
        command_adapter.get_cli_path.return_value = "/cli/path"

        result = runner.invoke(install, ["--stack", "/custom/stack.yaml"])

        assert result.exit_code == 0
        assert "Installation completed successfully." in result.output

    def test_install_no_docker(self, runner, command_adapter, os, spinner):
        # Simulate Docker not being installed by raising an error
        command_adapter.run.side_effect = click.ClickException(
            "docker: command not found")

        result = runner.invoke(install)

        assert result.exit_code == 1
        assert "Docker is not installed or not found in PATH." in result.output

    def test_install_build_sandboxes_failure(self, runner, command_adapter, os, spinner):
        """Test installation when sandbox building fails."""
        os.path.join.side_effect = lambda *args: "/".join(args)
        command_adapter.get_cli_path.return_value = "/cli/path"

        # First call (docker --version) succeeds, subsequent calls fail
        def side_effect(cmd, **kwargs):
            if cmd == ["docker", "--version"]:
                return []
            else:
                raise click.ClickException("Build failed")

        command_adapter.run.side_effect = side_effect

        result = runner.invoke(install)

        assert result.exit_code == 1
        assert "Build failed" in result.output

    def test_install_pull_images_failure(self, runner, command_adapter, os, spinner):
        """Test installation when image pulling fails."""
        os.path.join.side_effect = lambda *args: "/".join(args)
        command_adapter.get_cli_path.return_value = "/cli/path"

        call_count = 0

        def side_effect(cmd, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count == 1:  # docker --version
                return []
            elif "build" in cmd:  # sandbox builds
                return []
            else:  # docker compose pull
                raise click.ClickException("Pull failed")

        command_adapter.run.side_effect = side_effect

        result = runner.invoke(install)

        assert result.exit_code == 1
        assert "Pull failed" in result.output
