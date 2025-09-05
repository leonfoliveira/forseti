import pytest
from click.testing import CliRunner

from cli.__main__ import judge


class TestMainCLI:
    """Test cases for the main CLI entry point."""

    @pytest.fixture
    def runner(self):
        return CliRunner()

    def test_judge_group_exists(self, runner):
        """Test that the main judge CLI group exists and responds."""
        result = runner.invoke(judge, ["--help"])

        assert result.exit_code == 0
        assert "Usage: judge [OPTIONS] COMMAND [ARGS]..." in result.output

    def test_all_commands_registered(self, runner):
        """Test that all expected commands are registered with the CLI."""
        result = runner.invoke(judge, ["--help"])

        assert result.exit_code == 0
        # Verify all main commands are listed
        assert "contest" in result.output
        assert "install" in result.output
        assert "system" in result.output

    def test_contest_command_accessible(self, runner):
        """Test that the contest command is accessible via the main CLI."""
        result = runner.invoke(judge, ["contest", "--help"])

        assert result.exit_code == 0
        assert "Usage: judge contest [OPTIONS] COMMAND [ARGS]..." in result.output

    def test_install_command_accessible(self, runner):
        """Test that the install command is accessible via the main CLI."""
        result = runner.invoke(judge, ["install", "--help"])

        assert result.exit_code == 0
        assert "Usage: judge install [OPTIONS]" in result.output

    def test_system_command_accessible(self, runner):
        """Test that the system command is accessible via the main CLI."""
        result = runner.invoke(judge, ["system", "--help"])

        assert result.exit_code == 0
        assert "Usage: judge system [OPTIONS] COMMAND [ARGS]..." in result.output

    def test_invalid_command(self, runner):
        """Test error handling for invalid commands."""
        result = runner.invoke(judge, ["nonexistent"])

        assert result.exit_code == 2
        assert "No such command 'nonexistent'" in result.output

    def test_no_command_shows_help(self, runner):
        """Test that invoking judge without a command shows usage information."""
        result = runner.invoke(judge)

        # Click groups return exit code 2 when no command is provided, which is expected
        assert result.exit_code == 2
        assert "Usage: judge [OPTIONS] COMMAND [ARGS]..." in result.output
        assert "Commands:" in result.output

    def test_contest_subcommands_available(self, runner):
        """Test that contest subcommands are available."""
        result = runner.invoke(judge, ["contest", "--help"])

        assert result.exit_code == 0
        # Check for contest subcommands
        output_lines = result.output.lower()
        assert "create" in output_lines or "list" in output_lines

    def test_system_subcommands_available(self, runner):
        """Test that system subcommands are available."""
        result = runner.invoke(judge, ["system", "--help"])

        assert result.exit_code == 0
        # Check for system subcommands
        output_lines = result.output.lower()
        assert "start" in output_lines or "stop" in output_lines

    def test_command_structure_integrity(self, runner):
        """Test the overall command structure and hierarchy."""
        # Test main group
        result = runner.invoke(judge, ["--help"])
        assert result.exit_code == 0

        # Test that each top-level command is a group or command
        for command_name in ["contest", "install", "system"]:
            result = runner.invoke(judge, [command_name, "--help"])
            assert result.exit_code == 0, f"Command '{command_name}' should be accessible"

    def test_judge_group_callable(self):
        """Test that the judge group is properly callable."""
        # Test that judge is a Click group
        assert hasattr(judge, 'commands')
        assert 'contest' in judge.commands
        assert 'install' in judge.commands
        assert 'system' in judge.commands

    def test_version_or_info_not_breaking(self, runner):
        """Test that common CLI patterns don't break the application."""
        # Test that these don't cause crashes even if not implemented
        result = runner.invoke(judge, ["--version"])
        # Should either work or show help, but not crash
        assert result.exit_code in [0, 2]

        result = runner.invoke(judge, ["-v"])
        # Should either work or show error, but not crash
        assert result.exit_code in [0, 2]

    def test_main_module_direct_execution(self):
        """Test that the main module can be imported and executed directly."""
        # Test importing the main module
        import cli.__main__ as main_module

        # Verify the module structure
        assert hasattr(main_module, 'judge')
        assert hasattr(main_module, 'contest')
        assert hasattr(main_module, 'install')
        assert hasattr(main_module, 'system')

        # Test that the judge function has the right commands
        judge_func = main_module.judge
        assert hasattr(judge_func, 'commands')
        assert len(judge_func.commands) == 3

        # Verify command names
        command_names = set(judge_func.commands.keys())
        expected_commands = {'contest', 'install', 'system'}
        assert command_names == expected_commands

    def test_command_registration_order(self):
        """Test that commands are registered in the expected order."""
        import cli.__main__ as main_module

        # Get the list of commands as they were added
        commands_list = list(main_module.judge.commands.keys())

        # While order isn't strictly required, this test ensures consistency
        expected_commands = ['contest', 'install', 'system']
        assert commands_list == expected_commands

    def test_cli_integration_smoke_test(self, runner):
        """Smoke test to ensure basic CLI integration works end-to-end."""
        # Test that we can get help for each command without errors
        commands_to_test = ['contest', 'install', 'system']

        for cmd in commands_to_test:
            result = runner.invoke(judge, [cmd, '--help'])
            assert result.exit_code == 0, f"Help for '{cmd}' command failed"
            assert cmd in result.output.lower(
            ), f"Command '{cmd}' not found in its own help"
