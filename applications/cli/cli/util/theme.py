from enum import Enum


class ColorTheme(Enum):
    """Standard CLI color theme following industry conventions."""

    # Status colors
    SUCCESS = "bright_green"  # Successful operations, completed tasks
    ERROR = "bright_red"  # Critical errors, failures
    WARNING = "yellow"  # Warnings, caution needed
    INFO = "bright_blue"  # General information, neutral status

    # Progress and interaction
    PROGRESS = "cyan"  # Progress indicators, loading states
    PROMPT = "bright_cyan"  # User prompts, interactive elements

    # Content highlighting
    PRIMARY = "white"  # Primary content, emphasis
    SECONDARY = "bright_black"  # Secondary content, metadata, timestamps
    ACCENT = "magenta"  # Special highlighting, debug info

    # Service/Resource identification
    SERVICE_NAME = "bright_cyan"  # Service names, resource identifiers
    CONTAINER_ID = "magenta"  # Container IDs, technical identifiers
    NODE_NAME = "blue"  # Node names, host information

    # State-specific colors for status display
    STATE_RUNNING = "bright_green"  # Running/active state
    STATE_HEALTHY = "green"  # Healthy status
    STATE_STARTING = "yellow"  # Starting/transitioning state
    STATE_PENDING = "yellow"  # Pending state
    STATE_FAILED = "bright_red"  # Failed state
    STATE_STOPPED = "bright_black"  # Stopped/inactive state
    STATE_ASSIGNED = "blue"  # Assigned state
    STATE_READY = "cyan"  # Ready state


def colorize(text: str, color: ColorTheme) -> str:
    """
    Apply color markup to text using the standard theme.

    Args:
        text: The text to colorize
        color: The color theme to apply

    Returns:
        Text wrapped in rich markup tags
    """
    return f"[{color.value}]{text}[/{color.value}]"


def status_with_icon(text: str, color: ColorTheme, icon: str = "") -> str:
    """
    Create a status message with color and optional icon.

    Args:
        text: The status text
        color: The color theme to apply
        icon: Optional unicode icon

    Returns:
        Formatted status message
    """
    if icon:
        return f"[{color.value}]{icon} {text}[/{color.value}]"
    return f"[{color.value}]{text}[/{color.value}]"


# Common message templates for consistency
class Messages:
    """Common message templates using the standard theme."""

    @staticmethod
    def success(text: str) -> str:
        return colorize(text, ColorTheme.SUCCESS)

    @staticmethod
    def error(text: str) -> str:
        return colorize(text, ColorTheme.ERROR)

    @staticmethod
    def warning(text: str) -> str:
        return colorize(text, ColorTheme.WARNING)

    @staticmethod
    def info(text: str) -> str:
        return colorize(text, ColorTheme.INFO)

    @staticmethod
    def progress(text: str) -> str:
        return colorize(text, ColorTheme.PROGRESS)

    @staticmethod
    def service_name(name: str) -> str:
        return colorize(name, ColorTheme.SERVICE_NAME)

    @staticmethod
    def container_id(container_id: str) -> str:
        return colorize(container_id, ColorTheme.CONTAINER_ID)

    @staticmethod
    def node_name(name: str) -> str:
        return colorize(name, ColorTheme.NODE_NAME)


# Status formatters for consistent state display
class StatusFormatter:
    """Formatters for different system states."""

    @staticmethod
    def running() -> str:
        return status_with_icon("running", ColorTheme.STATE_RUNNING, "✔")

    @staticmethod
    def healthy() -> str:
        return status_with_icon("healthy", ColorTheme.STATE_HEALTHY, "✔")

    @staticmethod
    def unhealthy() -> str:
        return status_with_icon("unhealthy", ColorTheme.ERROR, "✖")

    @staticmethod
    def starting() -> str:
        return status_with_icon("starting", ColorTheme.STATE_STARTING, "⏳")

    @staticmethod
    def preparing() -> str:
        return status_with_icon("preparing", ColorTheme.STATE_STARTING, "⏳")

    @staticmethod
    def pending() -> str:
        return status_with_icon("pending", ColorTheme.STATE_PENDING, "⏳")

    @staticmethod
    def assigned() -> str:
        return status_with_icon("assigned", ColorTheme.STATE_ASSIGNED, "📋")

    @staticmethod
    def accepted() -> str:
        return status_with_icon("accepted", ColorTheme.STATE_ASSIGNED, "✓")

    @staticmethod
    def ready() -> str:
        return status_with_icon("ready", ColorTheme.STATE_READY, "⚡")

    @staticmethod
    def failed() -> str:
        return status_with_icon("failed", ColorTheme.STATE_FAILED, "✖")

    @staticmethod
    def shutdown() -> str:
        return status_with_icon("shutdown", ColorTheme.STATE_STOPPED, "⏹")

    @staticmethod
    def rejected() -> str:
        return status_with_icon("rejected", ColorTheme.ERROR, "⚠")

    @staticmethod
    def complete() -> str:
        return status_with_icon("complete", ColorTheme.SUCCESS, "✔")

    @staticmethod
    def unknown(state: str) -> str:
        return colorize(state, ColorTheme.SECONDARY)


# Contest-specific status formatters
class ContestStatusFormatter:
    """Formatters for contest states."""

    @staticmethod
    def not_started() -> str:
        return colorize("Not Started", ColorTheme.WARNING)

    @staticmethod
    def active() -> str:
        return colorize("Active", ColorTheme.SUCCESS)

    @staticmethod
    def finished() -> str:
        return colorize("Finished", ColorTheme.ERROR)
