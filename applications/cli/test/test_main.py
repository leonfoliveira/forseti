import pytest
from click.testing import CliRunner

from cli.__main__ import forseti


class TestMainCLI:
    """Test cases for the main CLI entry point."""

    @pytest.fixture
    def runner(self):
        return CliRunner()

    def test_forseti_group_exists(self, runner):
        """Test that the main forseti CLI group exists and responds."""
        result = runner.invoke(forseti, ["--help"])

        assert result.exit_code == 0
        assert "Usage: forseti [OPTIONS] COMMAND [ARGS]..." in result.output

    def test_all_commands_registered(self, runner):
        """Test that all expected commands are registered with the CLI."""
        result = runner.invoke(forseti, ["--help"])

        assert result.exit_code == 0
        # Verify all main commands are listed
        assert "contest" in result.output
        assert "install" in result.output
        assert "swarm" in result.output
        assert "system" in result.output

    def test_contest_command_accessible(self, runner):
        """Test that the contest command is accessible via the main CLI."""
        result = runner.invoke(forseti, ["contest", "--help"])

        assert result.exit_code == 0
        assert "Usage: forseti contest [OPTIONS] COMMAND [ARGS]..." in result.output

    def test_install_command_accessible(self, runner):
        """Test that the install command is accessible via the main CLI."""
        result = runner.invoke(forseti, ["install", "--help"])

        assert result.exit_code == 0
        assert "Usage: forseti install [OPTIONS]" in result.output

    def test_swarm_command_accessible(self, runner):
        """Test that the swarm command is accessible via the main CLI."""
        result = runner.invoke(forseti, ["swarm", "--help"])

        assert result.exit_code == 0
        assert "Usage: forseti swarm [OPTIONS] COMMAND [ARGS]..." in result.output

    def test_system_command_accessible(self, runner):
        """Test that the system command is accessible via the main CLI."""
        result = runner.invoke(forseti, ["system", "--help"])

        assert result.exit_code == 0
        assert "Usage: forseti system [OPTIONS] COMMAND [ARGS]..." in result.output

    def test_invalid_command(self, runner):
        """Test error handling for invalid commands."""
        result = runner.invoke(forseti, ["nonexistent"])

        assert result.exit_code == 2
        assert "No such command 'nonexistent'" in result.output

    def test_no_command_shows_help(self, runner):
        """Test that invoking forseti without a command shows usage information."""
        result = runner.invoke(forseti)

        # Click groups return exit code 2 when no command is provided, which is expected
        assert result.exit_code == 2
        assert "Usage: forseti [OPTIONS] COMMAND [ARGS]..." in result.output
        assert "Commands:" in result.output

    def test_contest_subcommands_available(self, runner):
        """Test that contest subcommands are available."""
        result = runner.invoke(forseti, ["contest", "--help"])

        assert result.exit_code == 0
        # Check for contest subcommands
        output_lines = result.output.lower()
        assert "create" in output_lines or "list" in output_lines

    def test_system_subcommands_available(self, runner):
        """Test that system subcommands are available."""
        result = runner.invoke(forseti, ["system", "--help"])

        assert result.exit_code == 0
        # Check for system subcommands
        output_lines = result.output.lower()
        assert "start" in output_lines or "stop" in output_lines

    def test_command_structure_integrity(self, runner):
        """Test the overall command structure and hierarchy."""
        # Test main group
        result = runner.invoke(forseti, ["--help"])
        assert result.exit_code == 0

        # Test that each top-level command is a group or command
        for command_name in ["contest", "install", "system"]:
            result = runner.invoke(forseti, [command_name, "--help"])
            assert result.exit_code == 0, f"Command '{command_name}' should be accessible"

    def test_forseti_group_callable(self):
        """Test that the forseti group is properly callable."""
        # Test that forseti is a Click group
        assert hasattr(forseti, 'commands')
        assert 'contest' in forseti.commands
        assert 'install' in forseti.commands
        assert 'swarm' in forseti.commands
        assert 'system' in forseti.commands

    def test_version_or_info_not_breaking(self, runner):
        """Test that common CLI patterns don't break the application."""
        # Test that these don't cause crashes even if not implemented
        result = runner.invoke(forseti, ["--version"])
        # Should either work or show help, but not crash
        assert result.exit_code in [0, 2]

        result = runner.invoke(forseti, ["-v"])
        # Should either work or show error, but not crash
        assert result.exit_code in [0, 2]

    def test_main_module_direct_execution(self):
        """Test that the main module can be imported and executed directly."""
        # Test importing the main module
        import cli.__main__ as main_module

        # Verify the module structure
        assert hasattr(main_module, 'forseti')
        assert hasattr(main_module, 'backup')
        assert hasattr(main_module, 'contest')
        assert hasattr(main_module, 'install')
        assert hasattr(main_module, 'swarm')
        assert hasattr(main_module, 'system')

        # Test that the forseti function has the right commands
        forseti_func = main_module.forseti
        assert hasattr(forseti_func, 'commands')
        assert len(forseti_func.commands) == 5

        # Verify command names
        command_names = set(forseti_func.commands.keys())
        expected_commands = {'backup', 'contest', 'install', 'swarm', 'system'}
        assert command_names == expected_commands

    def test_command_registration_order(self):
        """Test that commands are registered in the expected order."""
        import cli.__main__ as main_module

        # Get the list of commands as they were added
        commands_list = list(main_module.forseti.commands.keys())

        # While order isn't strictly required, this test ensures consistency
        expected_commands = ['backup', 'contest', 'install', 'swarm', 'system']
        assert commands_list == expected_commands

    def test_cli_integration_smoke_test(self, runner):
        """Smoke test to ensure basic CLI integration works end-to-end."""
        # Test that we can get help for each command without errors
        commands_to_test = ['contest', 'install', 'system']

        for cmd in commands_to_test:
            result = runner.invoke(forseti, [cmd, '--help'])
            assert result.exit_code == 0, f"Help for '{cmd}' command failed"
            assert cmd in result.output.lower(
            ), f"Command '{cmd}' not found in its own help"
