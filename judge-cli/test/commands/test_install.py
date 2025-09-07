import pytest
from unittest.mock import patch, MagicMock
from click.testing import CliRunner

from cli.commands.install import install

BASE_PATH = "cli.commands.install"


class TestInstallCommand:
    """Test cases for the install command functionality."""

    @pytest.fixture(autouse=True)
    def command_adapter(self):
        with patch(f"{BASE_PATH}.CommandAdapter") as mock:
            yield mock.return_value

    @pytest.fixture(autouse=True)
    def input_adapter(self):
        with patch(f"{BASE_PATH}.InputAdapter") as mock:
            yield mock.return_value

    @pytest.fixture(autouse=True)
    def os(self):
        with patch(f"{BASE_PATH}.os") as mock:
            yield mock

    @pytest.fixture(autouse=True)
    def socket(self):
        with patch(f"{BASE_PATH}.socket") as mock:
            yield mock

    @pytest.fixture(autouse=True)
    def subprocess(self):
        with patch(f"{BASE_PATH}.subprocess") as mock:
            # Mock the subprocess.run call in _setup_swarm
            mock.run.return_value.stdout.strip.return_value = "inactive"
            mock.DEVNULL = MagicMock()
            yield mock

    @pytest.fixture
    def runner(self):
        return CliRunner()

    def test_install(self, runner, command_adapter, input_adapter, os, socket, subprocess):
        """Test successful installation with custom stack file."""
        # Setup mocks - correct password order based on the actual implementation
        input_adapter.password.side_effect = [
            "db_password",      # DB password
            "root_password",    # Root password
            "grafana_admin_password",  # Grafana admin password
            "jwt_secret",       # JWT secret
        ]
        input_adapter.checkbox.return_value = [
            "gcc:15.1.0",
            "eclipse-temurin:21-jdk-alpine",
            "python:3.12.3-alpine",
        ]
        os.path.exists.return_value = True

        # Setup socket mock properly
        mock_socket = MagicMock()
        mock_socket.getsockname.return_value = ("192.168.1.1", 12345)
        socket.socket.return_value = mock_socket

        # Fix the command invocation - remove invalid --stack-name argument
        result = runner.invoke(
            install, ["--stack", "custom_stack.yaml"]
        )

        # Verify the command succeeded
        assert result.exit_code == 0
        assert "Judge system installed successfully." in result.output

        # Verify that the required methods were called
        assert input_adapter.password.call_count == 4
        assert input_adapter.checkbox.call_count == 1
        os.path.exists.assert_called_once_with("custom_stack.yaml")

        # Verify command adapter was called for Docker operations
        assert command_adapter.run.call_count > 0

        # Verify socket operations
        socket.socket.assert_called_once()
        mock_socket.connect.assert_called_once_with(("8.8.8.8", 80))
        mock_socket.getsockname.assert_called_once()
        mock_socket.close.assert_called_once()

    def test_install_with_default_stack(self, runner, command_adapter, input_adapter, os, socket, subprocess):
        """Test installation using the default stack.yaml file."""
        # Test using default stack.yaml file
        input_adapter.password.side_effect = [
            "db_password",
            "root_password",
            "grafana_admin_password",
            "jwt_secret",
        ]
        input_adapter.checkbox.return_value = ["gcc:15.1.0"]
        os.path.exists.return_value = True

        mock_socket = MagicMock()
        mock_socket.getsockname.return_value = ("127.0.0.1", 12345)
        socket.socket.return_value = mock_socket

        result = runner.invoke(install)

        assert result.exit_code == 0
        os.path.exists.assert_called_once_with("stack.yaml")

    def test_install_stack_file_not_exists(self, runner, command_adapter, input_adapter, os, socket, subprocess):
        """Test error handling when the specified stack file doesn't exist."""
        # Test error when stack file doesn't exist
        os.path.exists.return_value = False

        result = runner.invoke(install, ["--stack", "nonexistent.yaml"])

        assert result.exit_code == 1
        assert "Stack file 'nonexistent.yaml' does not exist." in result.output

        # Verify that setup methods are not called when stack file doesn't exist
        input_adapter.password.assert_not_called()
        input_adapter.checkbox.assert_not_called()
        command_adapter.run.assert_not_called()

    def test_install_with_empty_jwt_secret(self, runner, command_adapter, input_adapter, os, socket, subprocess):
        """Test automatic JWT secret generation when user provides empty input."""
        # Test JWT secret generation when empty password is provided
        input_adapter.password.side_effect = [
            "db_password",
            "root_password",
            "grafana_admin_password",
            "",  # Empty JWT secret should trigger random generation
        ]
        input_adapter.checkbox.return_value = ["python:3.12.3-alpine"]
        os.path.exists.return_value = True

        mock_socket = MagicMock()
        mock_socket.getsockname.return_value = ("192.168.1.1", 12345)
        socket.socket.return_value = mock_socket

        result = runner.invoke(install, ["--stack", "test_stack.yaml"])

        assert result.exit_code == 0
        # Verify a random JWT secret was generated and used
        docker_secret_calls = [call for call in command_adapter.run.call_args_list
                               if "docker" in call[0][0] and "secret" in call[0][0]]
        # Should have calls for creating jwt_secret
        jwt_secret_calls = [call for call in docker_secret_calls
                            if "jwt_secret" in call[0][0]]
        assert len(jwt_secret_calls) > 0

    def test_install_with_existing_swarm(self, runner, command_adapter, input_adapter, os, socket, subprocess):
        """Test installation when Docker swarm is already initialized and active."""
        # Test when Docker swarm is already active
        input_adapter.password.side_effect = [
            "db_password",
            "root_password",
            "grafana_admin_password",
            "jwt_secret",
        ]
        input_adapter.checkbox.return_value = ["gcc:15.1.0"]
        os.path.exists.return_value = True

        mock_socket = MagicMock()
        mock_socket.getsockname.return_value = ("192.168.1.1", 12345)
        socket.socket.return_value = mock_socket

        # Mock swarm already active
        subprocess.run.return_value.stdout.strip.return_value = "active"

        result = runner.invoke(install)

        assert result.exit_code == 0
        assert "Using existing swarm." in result.output

    def test_install_socket_exception_fallback(self, runner, command_adapter, input_adapter, os, socket, subprocess):
        """Test fallback to localhost when network discovery fails."""
        # Test fallback to 127.0.0.1 when socket connection fails
        input_adapter.password.side_effect = [
            "db_password",
            "root_password",
            "grafana_admin_password",
            "jwt_secret",
        ]
        input_adapter.checkbox.return_value = ["gcc:15.1.0"]
        os.path.exists.return_value = True

        mock_socket = MagicMock()
        mock_socket.connect.side_effect = Exception("Connection failed")
        socket.socket.return_value = mock_socket

        result = runner.invoke(install)

        assert result.exit_code == 0
        mock_socket.close.assert_called_once()
