import pytest
from unittest.mock import patch
import questionary

from cli.util.input_adapter import InputAdapter

BASE_PATH = "cli.util.input_adapter"


class TestInputAdapter:
    @pytest.fixture(autouse=True)
    def questionary(self):
        with patch(f"{BASE_PATH}.questionary") as mock:
            yield mock

    @pytest.fixture
    def sut(self):
        yield InputAdapter()

    def test_text(self, sut, questionary):
        questionary.text.return_value.ask.return_value = "user input"
        result = sut.text("Enter something")

        questionary.text.assert_called_once_with("Enter something")
        assert result == "user input"

    def test_text_keyboard_interrupt(self, sut, questionary):
        questionary.text.return_value.ask.return_value = None

        with pytest.raises(KeyboardInterrupt):
            sut.text("Enter something")

        questionary.text.assert_called_once_with("Enter something")

    def test_password(self, sut, questionary):
        questionary.password.return_value.ask.return_value = "secret"
        result = sut.password("Enter password")

        questionary.password.assert_called_once_with("Enter password")
        assert result == "secret"

    def test_password_keyboard_interrupt(self, sut, questionary):
        questionary.password.return_value.ask.return_value = None

        with pytest.raises(KeyboardInterrupt):
            sut.password("Enter password")

        questionary.password.assert_called_once_with("Enter password")

    def test_checkbox(self, sut, questionary):
        choices = [questionary.Choice(
            "Option 1"), questionary.Choice("Option 2")]
        questionary.checkbox.return_value.ask.return_value = ["Option 1"]
        result = sut.checkbox("Select options", choices=choices)

        questionary.checkbox.assert_called_once_with(
            "Select options", choices=choices)
        assert result == ["Option 1"]

    def test_checkbox_keyboard_interrupt(self, sut, questionary):
        choices = [questionary.Choice(
            "Option 1"), questionary.Choice("Option 2")]
        questionary.checkbox.return_value.ask.return_value = None

        with pytest.raises(KeyboardInterrupt):
            sut.checkbox("Select options", choices=choices)

        questionary.checkbox.assert_called_once_with(
            "Select options", choices=choices)
