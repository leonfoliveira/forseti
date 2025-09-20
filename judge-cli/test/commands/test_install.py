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

    def test_install_no_mkcert(self, runner, command_adapter, os, spinner):
        # Simulate mkcert not being installed by raising an error
        command_adapter.run.side_effect = click.ClickException(
            "mkcert: command not found")

        result = runner.invoke(install)

        assert result.exit_code == 1
        assert "mkcert is not installed or not found in PATH." in result.output

    def test_install_no_docker(self, runner, command_adapter, os, spinner):
        # Simulate Docker not being installed by raising an error
        command_adapter.run.side_effect = [[], click.ClickException(
            "docker: command not found")
        ]

        result = runner.invoke(install)

        assert result.exit_code == 1
        assert "Docker is not installed or not found in PATH." in result.output

    def test_install_certificates_failure(self, runner, command_adapter, os, spinner):
        """Test installation when certificate installation fails."""
        os.path.join.side_effect = lambda *args: "/".join(args)
        command_adapter.get_cli_path.return_value = "/cli/path"

        # First call (docker --version) succeeds, second call (mkcert -install) fails
        command_adapter.run.side_effect = [
            [],
            [],  # docker --version
            click.ClickException("mkcert failed")
        ]

        result = runner.invoke(install)

        assert result.exit_code == 1
        assert "mkcert failed" in result.output

    def test_install_certificates(self, runner, command_adapter, os, spinner):
        """Test successful certificate installation."""
        os.path.join.side_effect = lambda *args: "/".join(args)
        os.path.exists.return_value = False
        command_adapter.get_cli_path.return_value = "/cli/path"

        result = runner.invoke(install)

        assert result.exit_code == 0
        assert "Installation completed successfully." in result.output
        command_adapter.run.assert_any_call(["mkcert", "-install"])
        command_adapter.run.assert_any_call(["mkcert", "-cert-file", "/cli/path/certs/cert.pem",
                                            "-key-file", "/cli/path/certs/key.pem", "*.judge", "localhost", "127.0.0.1", "::1"])

    def test_install_build_sandboxes_failure(self, runner, command_adapter, os, spinner):
        """Test installation when sandbox building fails."""
        os.path.join.side_effect = lambda *args: "/".join(args)
        command_adapter.get_cli_path.return_value = "/cli/path"

        command_adapter.run.side_effect = [
            [],  # docker --version
            [],  # mkcert -install
            [],  # mkcert command
            click.ClickException("Build failed")  # sandbox build fails
        ]

        result = runner.invoke(install)

        assert result.exit_code == 1
        assert "Build failed" in result.output

    def test_install_pull_images_failure(self, runner, command_adapter, os, spinner):
        """Test installation when image pulling fails."""
        os.path.join.side_effect = lambda *args: "/".join(args)
        command_adapter.get_cli_path.return_value = "/cli/path"

        command_adapter.run.side_effect = [
            [],  # docker --version
            [],  # mkcert -install
            [],  # mkcert command
            [], [], [],  # sandbox builds
            click.ClickException("Pull failed")  # image pull fails
        ]

        result = runner.invoke(install)

        assert result.exit_code == 1
        assert "Pull failed" in result.output
