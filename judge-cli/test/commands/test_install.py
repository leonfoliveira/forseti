import pytest
from unittest.mock import patch
from click.testing import CliRunner

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
    def input_adapter(self):
        with patch(f"{BASE_PATH}.InputAdapter") as mock:
            yield mock.return_value

    @pytest.fixture(autouse=True)
    def os(self):
        with patch(f"{BASE_PATH}.os") as mock:
            yield mock

    @pytest.fixture
    def runner(self):
        return CliRunner()

    def test_install(self, runner, command_adapter, input_adapter, os):
        """Test successful installation."""
        input_adapter.checkbox.return_value = [
            "cpp17",
            "java21",
            "python3_12",
        ]
        os.path.join.side_effect = lambda *args: "/".join(args)
        command_adapter.get_cli_path.return_value = "/cli/path"

        result = runner.invoke(install)

        # Verify the command succeeded
        assert result.exit_code == 0
        assert "Judge system installed successfully." in result.output

        # Verify that the required methods were called
        assert input_adapter.checkbox.call_count == 1

        # Verify command adapter was called for Docker operations
        assert command_adapter.run.call_count > 0

    def test_install_no_docker(self, runner, command_adapter, input_adapter, os):
        # Simulate Docker not being installed by raising an error
        from cli.util.command_adapter import CommandAdapter
        command_adapter.run.side_effect = CommandAdapter.Error(
            1, "docker: command not found")

        result = runner.invoke(install)

        assert result.exit_code == 1
        assert "Docker is not installed or not found in PATH." in result.output
