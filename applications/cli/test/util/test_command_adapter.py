from unittest.mock import patch, MagicMock
import pytest
import subprocess

from cli.util.command_adapter import CommandAdapter, CommandResult

PACKAGE = "cli.util.command_adapter"


class TestCommandResult:
    def test_command_result_init_success(self):
        """Test CommandResult initialization for success case"""
        result = CommandResult(success=True, stdout="output", stderr="error")

        assert result.success is True
        assert result.stdout == "output"
        assert result.stderr == "error"
        assert result.error_message == ""

    def test_command_result_init_failure(self):
        """Test CommandResult initialization for failure case"""
        result = CommandResult(
            success=False,
            stdout="",
            stderr="error",
            error_message="Command failed"
        )

        assert result.success is False
        assert result.stdout == ""
        assert result.stderr == "error"
        assert result.error_message == "Command failed"

    def test_command_result_init_defaults(self):
        """Test CommandResult initialization with default values"""
        result = CommandResult(success=True)

        assert result.success is True
        assert result.stdout == ""
        assert result.stderr == ""
        assert result.error_message == ""


class TestCommandAdapter:
    @pytest.fixture
    def mock_console(self):
        return MagicMock()

    @pytest.fixture
    def adapter(self, mock_console):
        return CommandAdapter(mock_console)

    @pytest.fixture(autouse=True)
    def mock_subprocess_run(self):
        with patch(f"{PACKAGE}.subprocess.run") as mock_run:
            mock_result = MagicMock()
            mock_result.stdout = "test output"
            mock_result.stderr = "test error"
            mock_result.returncode = 0
            mock_run.return_value = mock_result
            yield mock_run

    def test_run_success(self, adapter, mock_subprocess_run):
        """Test successful command execution"""
        result = adapter.run("echo 'hello'")

        assert result.success is True
        assert result.stdout == "test output"
        assert result.stderr == "test error"
        mock_subprocess_run.assert_called_once()

    def test_run_with_custom_parameters(self, adapter, mock_subprocess_run):
        """Test command execution with custom parameters"""
        result = adapter.run("echo 'hello'", timeout=60,
                             check=False, capture_output=False)

        assert result.success is True
        mock_subprocess_run.assert_called_once_with(
            "echo 'hello'",
            shell=True,
            text=True,
            capture_output=False,
            timeout=60,
            check=False
        )

    def test_run_called_process_error(self, adapter, mock_subprocess_run, mock_console):
        """Test command execution with CalledProcessError"""
        error = subprocess.CalledProcessError(
            1, "cmd", output="out", stderr="err")
        mock_subprocess_run.side_effect = error

        result = adapter.run("failing_command")

        assert result.success is False
        assert result.stdout == "out"
        assert result.stderr == "err"
        assert "Command failed with exit code 1" in result.error_message
        mock_console.print.assert_called()

    def test_run_called_process_error_no_errors(self, adapter, mock_subprocess_run, mock_console):
        """Test command execution with CalledProcessError and show_errors=False"""
        error = subprocess.CalledProcessError(
            1, "cmd", output="out", stderr="err")
        mock_subprocess_run.side_effect = error

        result = adapter.run("failing_command", show_errors=False)

        assert result.success is False
        assert result.stdout == "out"
        assert result.stderr == "err"
        mock_console.print.assert_not_called()

    def test_run_timeout_expired(self, adapter, mock_subprocess_run, mock_console):
        """Test command execution with TimeoutExpired"""
        mock_subprocess_run.side_effect = subprocess.TimeoutExpired("cmd", 30)

        result = adapter.run("long_running_command", timeout=30)

        assert result.success is False
        assert result.error_message == "Command timed out after 30 seconds"
        mock_console.print.assert_called()

    def test_run_timeout_expired_no_errors(self, adapter, mock_subprocess_run, mock_console):
        """Test command execution with TimeoutExpired and show_errors=False"""
        mock_subprocess_run.side_effect = subprocess.TimeoutExpired("cmd", 30)

        result = adapter.run("long_running_command",
                             timeout=30, show_errors=False)

        assert result.success is False
        assert result.error_message == "Command timed out after 30 seconds"
        mock_console.print.assert_not_called()

    def test_run_file_not_found(self, adapter, mock_subprocess_run, mock_console):
        """Test command execution with FileNotFoundError"""
        mock_subprocess_run.side_effect = FileNotFoundError()

        result = adapter.run("nonexistent_command")

        assert result.success is False
        assert result.error_message == "Command not found"
        mock_console.print.assert_called()

    def test_run_file_not_found_with_help(self, adapter, mock_subprocess_run, mock_console):
        """Test command execution with FileNotFoundError and help message"""
        mock_subprocess_run.side_effect = FileNotFoundError()
        help_text = "Install the missing command with: apt-get install command"

        result = adapter.run("nonexistent_command",
                             missing_command_help=help_text)

        assert result.success is False
        assert result.error_message == "Command not found"
        # Should print both error and help message
        assert mock_console.print.call_count == 2

    def test_run_file_not_found_no_errors(self, adapter, mock_subprocess_run, mock_console):
        """Test command execution with FileNotFoundError and show_errors=False"""
        mock_subprocess_run.side_effect = FileNotFoundError()

        result = adapter.run("nonexistent_command", show_errors=False)

        assert result.success is False
        assert result.error_message == "Command not found"
        mock_console.print.assert_not_called()

    def test_run_silent(self, adapter, mock_subprocess_run):
        """Test run_silent method"""
        result = adapter.run_silent("echo 'hello'")

        assert result.success is True
        mock_subprocess_run.assert_called_once_with(
            "echo 'hello'",
            shell=True,
            text=True,
            capture_output=True,
            timeout=30,
            check=True
        )

    def test_run_silent_with_timeout(self, adapter, mock_subprocess_run):
        """Test run_silent method with custom timeout"""
        result = adapter.run_silent("echo 'hello'", timeout=60)

        assert result.success is True
        mock_subprocess_run.assert_called_once_with(
            "echo 'hello'",
            shell=True,
            text=True,
            capture_output=True,
            timeout=60,
            check=True
        )

    def test_run_with_live_output(self, adapter, mock_subprocess_run):
        """Test run_with_live_output method"""
        result = adapter.run_with_live_output("echo 'hello'")

        assert result.success is True
        mock_subprocess_run.assert_called_once_with(
            "echo 'hello'",
            shell=True,
            text=True,
            capture_output=False,
            timeout=30,
            check=True
        )

    def test_run_with_live_output_custom_timeout(self, adapter, mock_subprocess_run):
        """Test run_with_live_output method with custom timeout"""
        result = adapter.run_with_live_output("echo 'hello'", timeout=45)

        assert result.success is True
        mock_subprocess_run.assert_called_once_with(
            "echo 'hello'",
            shell=True,
            text=True,
            capture_output=False,
            timeout=45,
            check=True
        )

    def test_run_called_process_error_with_none_outputs(self, adapter, mock_subprocess_run):
        """Test CalledProcessError with None stdout/stderr"""
        error = subprocess.CalledProcessError(
            1, "cmd", output=None, stderr=None)
        mock_subprocess_run.side_effect = error

        result = adapter.run("failing_command")

        assert result.success is False
        assert result.stdout == ""
        assert result.stderr == ""
        assert "Command failed with exit code 1" in result.error_message

    def test_run_called_process_error_with_stderr_display(self, adapter, mock_subprocess_run, mock_console):
        """Test CalledProcessError stderr display"""
        error = subprocess.CalledProcessError(
            1, "cmd", output="out", stderr="specific error")
        mock_subprocess_run.side_effect = error

        result = adapter.run("failing_command")

        assert result.success is False
        # Should print both the general error and the specific stderr
        assert mock_console.print.call_count == 2
