import subprocess


class CommandAdapter:
    def run(self, command: list[str], throws=True, **kwargs) -> list[str]:
        result = subprocess.run(
            command, text=True, **kwargs)
        if throws and result.returncode != 0:
            raise Exception(result.stderr)
        if result.stdout is not None:
            return result.stdout.splitlines()
