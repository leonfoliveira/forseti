import click
import os
import subprocess
import sys


class CommandAdapter:
    class Error(Exception):
        def __init__(self, exit_code: int, message: str):
            super().__init__(message)
            self.message = message
            self.exit_code = exit_code

    def get_cli_path(self) -> str:
        cli_path = (
            os.path.dirname(sys.executable)
            if getattr(sys, "frozen", False)
            else os.path.dirname(
                os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            )
        )
        return cli_path

    def run(self, command: list[str], **kwargs) -> list[str]:
        result = subprocess.run(
            command, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, **kwargs)

        if result.returncode != 0:
            raise click.ClickException(result.stderr)
        return result.stdout.splitlines()
