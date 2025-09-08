try:
    from cli._version import __build_date__, __git_commit__, __version__
except ImportError:
    __version__ = "0.0.0"
    __git_commit__ = "unknown"
    __build_date__ = "unknown"

__stack_file__ = "stack.yaml"
__stack_name__ = "judge"
__api_url__ = "http://localhost:8080"
