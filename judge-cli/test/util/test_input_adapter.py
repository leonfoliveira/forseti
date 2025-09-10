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

    def test_password_with_kwargs(self, sut, questionary):
        questionary.password.return_value.ask.return_value = "secret"
        result = sut.password("Enter password", style="bold")

        questionary.password.assert_called_once_with(
            "Enter password", style="bold")
        assert result == "secret"
