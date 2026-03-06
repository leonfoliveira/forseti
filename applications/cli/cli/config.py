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
__working_dir__ = os.getcwd()

__backups_dir__ = os.path.join(__working_dir__, "backups")
__certs_dir__ = os.path.join(__working_dir__, "certs")
__sandboxes_dir__ = os.path.join(__working_dir__, "sandboxes")
__volumes_dir__ = os.path.join(__working_dir__, "volumes")

__stack_template_file__ = os.path.join(__working_dir__, "stack.yaml.j2")
__config_file__ = os.path.join(__working_dir__, "stack.conf")

__stack_name__ = "forseti"
