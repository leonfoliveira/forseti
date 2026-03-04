import pytest

from cli.util.theme import (
    ColorTheme, Messages, StatusFormatter, ContestStatusFormatter,
    colorize, status_with_icon
)


class TestColorTheme:
    def test_all_colors_defined(self):
        """Test that all expected color theme values are defined"""
        expected_colors = [
            "SUCCESS", "ERROR", "WARNING", "INFO",
            "PROGRESS", "PROMPT", "PRIMARY", "SECONDARY", "ACCENT",
            "SERVICE_NAME", "CONTAINER_ID", "NODE_NAME",
            "STATE_RUNNING", "STATE_HEALTHY", "STATE_STARTING",
            "STATE_PENDING", "STATE_FAILED", "STATE_STOPPED",
            "STATE_ASSIGNED", "STATE_READY"
        ]

        for color in expected_colors:
            assert hasattr(ColorTheme, color)
            assert isinstance(getattr(ColorTheme, color).value, str)

    def test_specific_color_values(self):
        """Test specific color theme values"""
        assert ColorTheme.SUCCESS.value == "bright_green"
        assert ColorTheme.ERROR.value == "bright_red"
        assert ColorTheme.WARNING.value == "yellow"
        assert ColorTheme.INFO.value == "bright_blue"


class TestColorizeFunction:
    def test_colorize_basic(self):
        """Test basic colorize function"""
        result = colorize("test text", ColorTheme.SUCCESS)
        assert result == "[bright_green]test text[/bright_green]"

    def test_colorize_different_colors(self):
        """Test colorize with different colors"""
        error_result = colorize("error", ColorTheme.ERROR)
        warning_result = colorize("warning", ColorTheme.WARNING)

        assert error_result == "[bright_red]error[/bright_red]"
        assert warning_result == "[yellow]warning[/yellow]"

    def test_colorize_empty_text(self):
        """Test colorize with empty text"""
        result = colorize("", ColorTheme.INFO)
        assert result == "[bright_blue][/bright_blue]"

    def test_colorize_special_characters(self):
        """Test colorize with special characters"""
        result = colorize("test@#$%", ColorTheme.ACCENT)
        assert result == "[magenta]test@#$%[/magenta]"


class TestStatusWithIcon:
    def test_status_with_icon_basic(self):
        """Test status_with_icon with icon"""
        result = status_with_icon("Running", ColorTheme.SUCCESS, "▶️")
        assert result == "[bright_green]▶️ Running[/bright_green]"

    def test_status_with_icon_no_icon(self):
        """Test status_with_icon without icon"""
        result = status_with_icon("Running", ColorTheme.SUCCESS)
        assert result == "[bright_green]Running[/bright_green]"

    def test_status_with_icon_empty_icon(self):
        """Test status_with_icon with empty icon string"""
        result = status_with_icon("Running", ColorTheme.SUCCESS, "")
        assert result == "[bright_green]Running[/bright_green]"


class TestMessages:
    def test_success_message(self):
        """Test success message formatting"""
        result = Messages.success("Operation completed")
        assert result == "[bright_green]Operation completed[/bright_green]"

    def test_error_message(self):
        """Test error message formatting"""
        result = Messages.error("Operation failed")
        assert result == "[bright_red]Operation failed[/bright_red]"

    def test_warning_message(self):
        """Test warning message formatting"""
        result = Messages.warning("Be careful")
        assert result == "[yellow]Be careful[/yellow]"

    def test_info_message(self):
        """Test info message formatting"""
        result = Messages.info("Information")
        assert result == "[bright_blue]Information[/bright_blue]"

    def test_progress_message(self):
        """Test progress message formatting"""
        result = Messages.progress("Loading...")
        assert result == "[cyan]Loading...[/cyan]"

    def test_service_name_message(self):
        """Test service name formatting"""
        result = Messages.service_name("api")
        assert result == "[bright_cyan]api[/bright_cyan]"

    def test_container_id_message(self):
        """Test container ID formatting"""
        result = Messages.container_id("abc123")
        assert result == "[magenta]abc123[/magenta]"

    def test_node_name_message(self):
        """Test node name formatting"""
        result = Messages.node_name("worker1")
        assert result == "[blue]worker1[/blue]"


class TestStatusFormatter:
    def test_running_status(self):
        """Test running status formatting"""
        result = StatusFormatter.running()
        assert "[green]" in result or "[bright_green]" in result
        assert "running" in result
        assert "✔" in result

    def test_healthy_status(self):
        """Test healthy status formatting"""
        result = StatusFormatter.healthy()
        assert "[green]" in result
        assert "healthy" in result
        assert "✔" in result

    def test_unhealthy_status(self):
        """Test unhealthy status formatting"""
        result = StatusFormatter.unhealthy()
        assert "[bright_red]" in result
        assert "unhealthy" in result
        assert "✖" in result

    def test_starting_status(self):
        """Test starting status formatting"""
        result = StatusFormatter.starting()
        assert "[yellow]" in result
        assert "starting" in result
        assert "⏳" in result

    def test_preparing_status(self):
        """Test preparing status formatting"""
        result = StatusFormatter.preparing()
        assert "[yellow]" in result
        assert "preparing" in result
        assert "⏳" in result

    def test_pending_status(self):
        """Test pending status formatting"""
        result = StatusFormatter.pending()
        assert "[yellow]" in result
        assert "pending" in result
        assert "⏳" in result

    def test_assigned_status(self):
        """Test assigned status formatting"""
        result = StatusFormatter.assigned()
        assert "[blue]" in result
        assert "assigned" in result
        assert "📋" in result

    def test_accepted_status(self):
        """Test accepted status formatting"""
        result = StatusFormatter.accepted()
        assert "[blue]" in result
        assert "accepted" in result
        assert "✓" in result

    def test_ready_status(self):
        """Test ready status formatting"""
        result = StatusFormatter.ready()
        assert "[cyan]" in result
        assert "ready" in result
        assert "⚡" in result

    def test_failed_status(self):
        """Test failed status formatting"""
        result = StatusFormatter.failed()
        assert "[bright_red]" in result
        assert "failed" in result
        assert "✖" in result

    def test_shutdown_status(self):
        """Test shutdown status formatting"""
        result = StatusFormatter.shutdown()
        assert "[bright_black]" in result
        assert "shutdown" in result
        assert "⏹" in result

    def test_rejected_status(self):
        """Test rejected status formatting"""
        result = StatusFormatter.rejected()
        assert "[bright_red]" in result
        assert "rejected" in result
        assert "⚠" in result

    def test_complete_status(self):
        """Test complete status formatting"""
        result = StatusFormatter.complete()
        assert "[bright_green]" in result
        assert "complete" in result
        assert "✔" in result

    def test_unknown_status(self):
        """Test unknown status formatting"""
        result = StatusFormatter.unknown("custom_state")
        assert "[bright_black]" in result
        assert "custom_state" in result


class TestContestStatusFormatter:
    def test_not_started_status(self):
        """Test not started contest status formatting"""
        result = ContestStatusFormatter.not_started()
        assert "[yellow]" in result
        assert "Not Started" in result

    def test_active_status(self):
        """Test active contest status formatting"""
        result = ContestStatusFormatter.active()
        assert "[bright_green]" in result
        assert "Active" in result

    def test_finished_status(self):
        """Test finished contest status formatting"""
        result = ContestStatusFormatter.finished()
        assert "[bright_red]" in result
        assert "Finished" in result


class TestThemeIntegration:
    def test_mix_functions_and_classes(self):
        """Test integration between different theme components"""
        # Test that functions and classes work together
        custom_message = colorize("Custom Status", ColorTheme.WARNING)
        standard_message = Messages.warning("Standard Status")

        # Both should use the same color
        assert "[yellow]" in custom_message
        assert "[yellow]" in standard_message

    def test_status_formatter_uses_correct_colors(self):
        """Test that status formatters use consistent colors"""
        running = StatusFormatter.running()
        success = Messages.success("Success")

        # Both should use green variants for positive states
        assert "green" in running.lower()
        assert "green" in success.lower()

    def test_all_formatters_return_strings(self):
        """Test that all formatters return valid strings"""
        formatters = [
            StatusFormatter.running,
            StatusFormatter.healthy,
            StatusFormatter.failed,
            StatusFormatter.pending,
            ContestStatusFormatter.active,
            ContestStatusFormatter.finished,
        ]

        for formatter in formatters:
            result = formatter()
            assert isinstance(result, str)
            assert len(result) > 0
