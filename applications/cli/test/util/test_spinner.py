import pytest
import time
from unittest.mock import patch, MagicMock
from cli.util.spinner import Spinner

BASE_PATH = "cli.util.spinner"


class TestSpinner:
    @pytest.fixture(autouse=True)
    def click(self):
        with patch(f"{BASE_PATH}.click") as mock:
            yield mock

    @pytest.fixture(autouse=True)
    def threading(self):
        with patch(f"{BASE_PATH}.threading") as mock:
            yield mock

    @pytest.fixture
    def sut(self):
        return Spinner("Testing")

    def test_init_default_label(self, click, threading):
        spinner = Spinner()
        assert spinner.label == "Processing..."
        assert spinner.idx == 0
        assert spinner.running is False
        assert spinner.thread is None

    def test_init_custom_label(self, click, threading):
        spinner = Spinner("Custom label")
        assert spinner.label == "Custom label"
        assert spinner.idx == 0
        assert spinner.running is False
        assert spinner.thread is None

    def test_start(self, sut, click, threading):
        mock_thread = MagicMock()
        threading.Thread.return_value = mock_thread

        sut.start()

        assert sut.running is True
        assert sut.thread == mock_thread
        threading.Thread.assert_called_once_with(target=sut._spin)
        mock_thread.start.assert_called_once()

    def test_complete(self, sut, click, threading):
        # Start spinner first
        mock_thread = MagicMock()
        threading.Thread.return_value = mock_thread
        sut.start()

        # Now complete it
        sut.complete()

        assert sut.running is False
        assert sut.thread is None
        mock_thread.join.assert_called_once()
        click.echo.assert_called_with(
            f"\r{click.style('✓', fg='green')} Testing")

    def test_complete_without_thread(self, sut, click, threading):
        sut.complete()

        assert sut.running is False
        assert sut.thread is None
        # Should not call click.echo when there's no thread
        click.echo.assert_not_called()

    def test_fail(self, sut, click, threading):
        # Start spinner first
        mock_thread = MagicMock()
        threading.Thread.return_value = mock_thread
        sut.start()

        # Now fail it
        sut.fail()

        assert sut.running is False
        assert sut.thread is None
        mock_thread.join.assert_called_once()
        click.echo.assert_called_with(
            f"\r{click.style('✗', fg='red')} Testing")

    def test_fail_without_thread(self, sut, click, threading):
        sut.fail()

        assert sut.running is False
        assert sut.thread is None
        # Should not call click.echo when there's no thread
        click.echo.assert_not_called()

    def test_spin(self, sut, click, threading):
        # Mock threading.Event().wait() to control the loop
        mock_event = MagicMock()
        threading.Event.return_value = mock_event

        # Make the spinner stop after a few iterations
        def side_effect(timeout):
            sut.running = False
        mock_event.wait.side_effect = side_effect

        sut.running = True
        sut._spin()

        # Verify click.echo was called with the spinning character
        click.echo.assert_called_with("\r| Testing", nl=False)
        mock_event.wait.assert_called_with(0.1)

    def test_spin_multiple_chars(self, sut, click, threading):
        # Mock threading.Event().wait() to control the loop
        mock_event = MagicMock()
        threading.Event.return_value = mock_event

        # Make the spinner run for 2 iterations
        call_count = 0

        def side_effect(timeout):
            nonlocal call_count
            call_count += 1
            if call_count >= 2:
                sut.running = False
        mock_event.wait.side_effect = side_effect

        sut.running = True
        sut.idx = 1  # Start at index 1 to test different character
        sut._spin()

        # Verify click.echo was called
        assert click.echo.call_count >= 1
        # Check that the first call used index 1 (/ character)
        first_call = click.echo.call_args_list[0]
        assert "\r/ Testing" in first_call[0][0]
