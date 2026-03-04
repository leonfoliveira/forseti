import os

__version__: str
__git_commit__: str
__build_date__: str

try:
    from cli._config import __build_date__, __git_commit__, __version__  # type: ignore
except ImportError:
    __version__ = "latest"
    __git_commit__ = "unknown"
    __build_date__ = "unknown"

__cli_dir__ = os.path.dirname(os.path.abspath(__file__))
__stack_file__ = os.path.join(__cli_dir__, "stack.yaml.j2")
__config_file__ = os.path.join(__cli_dir__, "stack.conf")
__sandboxes_dir__ = os.path.join(__cli_dir__, "sandboxes")
__backups_dir__ = os.path.join(__cli_dir__, "backups")
__root_ca_file__ = os.path.join(__cli_dir__, "certs", "rootCA.pem")
__stack_name__ = "forseti"
