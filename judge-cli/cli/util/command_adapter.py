import os
import subprocess
import sys


class CommandAdapter:
    def get_cli_path(self) -> str:
        cli_path = (
            os.path.dirname(sys.executable)
            if getattr(sys, "frozen", False)
            else os.path.dirname(
                os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            )
        )
        return cli_path

    def run(self, command: list[str], throws=True, **kwargs) -> list[str]:
        result = subprocess.run(command, text=True, **kwargs)
        if throws and result.returncode != 0:
            raise Exception(result.stderr)
        if result.stdout is not None:
            return result.stdout.splitlines()
