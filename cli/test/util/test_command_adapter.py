import pytest
from unittest.mock import patch

from cli.util.command_adapter import CommandAdapter

BASE_PATH = "cli.util.command_adapter"


class TestCommandAdapter:
    @pytest.fixture(autouse=True)
    def subprocess(self):
        with patch(f"{BASE_PATH}.subprocess") as mock:
            yield mock

    @pytest.fixture
    def sut(self):
        yield CommandAdapter()

    def test_run_successful(self, sut, subprocess):
        process = subprocess.run.return_value
        process.returncode = 0
        process.stdout = "line1\nline2\n"
        result = sut.run(["echo", "hello"])

        subprocess.run.assert_called_once_with(
            ["echo", "hello"], text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        assert result == ["line1", "line2"]

    def test_run_unsuccessful_throws(self, sut, subprocess):
        process = subprocess.run.return_value
        process.returncode = 1
        process.stderr = "error message"

        with pytest.raises(Exception) as excinfo:
            sut.run(["false"])

        subprocess.run.assert_called_once_with(
            ["false"], text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        assert "error message" in str(excinfo.value)

    def test_run_with_no_stdout(self, sut, subprocess):
        process = subprocess.run.return_value
        process.returncode = 0
        process.stdout = ""

        result = sut.run(["echo", "hello"])

        subprocess.run.assert_called_once_with(
            ["echo", "hello"], text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        assert result == []

    def test_get_cli_path_frozen(self, sut):
        with patch(f"{BASE_PATH}.sys") as mock_sys:
            mock_sys.executable = "/usr/bin/forseti"
            mock_sys.frozen = True
            with patch(f"{BASE_PATH}.getattr", return_value=True):
                with patch(f"{BASE_PATH}.os.path.dirname", return_value="/usr/bin") as mock_dirname:
                    result = sut.get_cli_path()
                    mock_dirname.assert_called_with("/usr/bin/forseti")
                    assert result == "/usr/bin"

    def test_get_cli_path_not_frozen(self, sut):
        with patch(f"{BASE_PATH}.sys") as mock_sys:
            mock_sys.executable = "/usr/bin/python"
            with patch(f"{BASE_PATH}.getattr", return_value=False):
                with patch(f"{BASE_PATH}.os.path.dirname") as mock_dirname:
                    with patch(f"{BASE_PATH}.os.path.abspath", return_value="/path/to/test_command_adapter.py") as mock_abspath:
                        mock_dirname.side_effect = ["/path/to", "/path", "/"]
                        result = sut.get_cli_path()
                        mock_abspath.assert_called_once()
                        assert result == "/"
