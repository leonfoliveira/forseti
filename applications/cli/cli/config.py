try:
    from cli._config import (__api_url__, __build_date__, __git_commit__,
                             __version__)
except ImportError:
    __version__ = "0.0.0"
    __git_commit__ = "unknown"
    __build_date__ = "unknown"
    __api_url__ = "http://localhost:8080/api"
