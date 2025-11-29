try:
    from applications.cli.cli._config import __build_date__, __git_commit__, __version__, __api_url__
except ImportError:
    __version__ = "0.0.0"
    __git_commit__ = "unknown"
    __build_date__ = "unknown"
    __api_url__ = "http://localhost:8080/api"
