import subprocess
from typing import Optional

from rich.console import Console

from .theme import Messages


class CommandResult:
    def __init__(
        self, success: bool, stdout: str = "", stderr: str = "", error_message: str = ""
    ):
        self.success = success
        self.stdout = stdout
        self.stderr = stderr
        self.error_message = error_message


class CommandAdapter:
    def __init__(self, console: Console):
        self.console = console

    def run(
        self,
        command: str,
        timeout: int = 30,
        check: bool = True,
        capture_output: bool = True,
        show_errors: bool = True,
        missing_command_help: str = "",
    ) -> CommandResult:
        """
        Execute a shell command with proper error handling.

        Args:
            command: Shell command to execute
            timeout: Command timeout in seconds (default: 30)
            check: Whether to raise exception on non-zero exit (default: True)
            capture_output: Whether to capture stdout/stderr (default: True)
            show_errors: Whether to display errors to console (default: True)
            missing_command_help: Help text to show if command not found

        Returns:
            CommandResult with success status and output/error details
        """
        try:
            result = subprocess.run(
                command,
                shell=True,
                text=True,
                capture_output=capture_output,
                timeout=timeout,
                check=check,
            )
            return CommandResult(
                success=True, stdout=result.stdout, stderr=result.stderr
            )

        except subprocess.CalledProcessError as e:
            error_msg = f"Command failed with exit code {e.returncode}"
            if show_errors:
                self.console.print(Messages.error(f"Error: {error_msg}"))
                if e.stderr:
                    self.console.print(Messages.error(e.stderr.strip()))
            return CommandResult(
                success=False,
                stdout=e.stdout or "",
                stderr=e.stderr or "",
                error_message=error_msg,
            )

        except subprocess.TimeoutExpired:
            error_msg = f"Command timed out after {timeout} seconds"
            if show_errors:
                self.console.print(Messages.error(f"Error: {error_msg}"))
            return CommandResult(success=False, error_message=error_msg)

        except FileNotFoundError:
            error_msg = "Command not found"
            if show_errors:
                self.console.print(Messages.error(f"Error: {error_msg}"))
                if missing_command_help:
                    self.console.print(Messages.warning(missing_command_help))
            return CommandResult(success=False, error_message=error_msg)

    def run_silent(self, command: str, timeout: int = 30) -> CommandResult:
        """Run command without displaying errors to console."""
        return self.run(command, timeout=timeout, show_errors=False)

    def run_with_live_output(self, command: str, timeout: int = 30) -> CommandResult:
        """Run command showing live output instead of capturing it."""
        return self.run(command, timeout=timeout, capture_output=False)
