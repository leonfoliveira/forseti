import pytest
from unittest.mock import patch
from click.testing import CliRunner

from cli.util.command_adapter import CommandAdapter
from cli.commands.swarm import swarm

BASE_PATH = "cli.commands.swarm"


class TestSwarmCommand:
    @pytest.fixture(autouse=True)
    def command_adapter(self):
        with patch(f"{BASE_PATH}.CommandAdapter") as mock:
            # Ensure CommandAdapter.Error is still the real exception class
            from cli.util.command_adapter import CommandAdapter
            mock.Error = CommandAdapter.Error
            yield mock.return_value

    @pytest.fixture(autouse=True)
    def input_adapter(self):
        with patch(f"{BASE_PATH}.InputAdapter") as mock:
            yield mock.return_value

    @pytest.fixture(autouse=True)
    def socket(self):
        with patch(f"{BASE_PATH}.socket") as mock:
            yield mock

    @pytest.fixture(autouse=True)
    def secrets(self):
        with patch(f"{BASE_PATH}.secrets") as mock:
            mock.token_urlsafe.return_value = "random_jwt_secret_123"
            yield mock

    @pytest.fixture
    def runner(self):
        return CliRunner()

    def test_init(self, runner, command_adapter, input_adapter, socket, secrets):
        # Mock socket behavior
        mock_socket_instance = socket.socket.return_value
        mock_socket_instance.getsockname.return_value = (
            "192.168.1.100", 12345)

        # Mock password inputs for secret creation
        input_adapter.password.side_effect = [
            "db_password",
            "root_password",
            "grafana_admin_password",
            "jwt_secret"
        ]

        worker_token = "SWMTKN-1-xxxx"
        manager_token = "SWMTKN-1-yyyy"
        manager_ip = "192.168.1.100"

        # Mock the command_adapter.run calls:
        # 1. docker swarm init
        # 2-5. docker secret create commands (4 secrets)
        # 6. docker swarm join-token worker (from info command)
        # 7. docker swarm join-token manager (from info command)
        command_adapter.run.side_effect = [
            [],  # docker swarm init returns empty stdout when successful
            [],  # docker secret create db_password
            [],  # docker secret create grafana_admin_password
            [],  # docker secret create jwt_secret
            [],  # docker secret create root_password
            [
                "To add a worker to this swarm, run the following command:",
                "",
                f"    docker swarm join --token {worker_token} {manager_ip}:2377"
            ],
            [
                "To add a manager to this swarm, run the following command:",
                "",
                f"    docker swarm join --token {manager_token} {manager_ip}:2377"
            ]
        ]

        result = runner.invoke(swarm, ["init"])

        assert result.exit_code == 0

        # Verify that docker swarm init was called with the correct IP
        assert command_adapter.run.call_args_list[0][0][0] == [
            "docker", "swarm", "init", "--advertise-addr", "192.168.1.100"
        ]

        # Verify that all 4 secrets were created
        secret_calls = [
            call for call in command_adapter.run.call_args_list[1:5]]
        # Fourth argument is the secret name
        secret_names = [call[0][0][3] for call in secret_calls]
        assert "db_password" in secret_names
        assert "grafana_admin_password" in secret_names
        assert "jwt_secret" in secret_names
        assert "root_password" in secret_names

        # Verify password inputs were called
        assert input_adapter.password.call_count == 4

    def test_init_already_in_swarm(self, runner, command_adapter, input_adapter, socket, secrets):
        # Mock socket behavior
        mock_socket_instance = socket.socket.return_value
        mock_socket_instance.getsockname.return_value = (
            "192.168.1.100", 12345)

        # Mock CommandAdapter.Error for already in swarm scenario
        from cli.util.command_adapter import CommandAdapter
        command_adapter.run.side_effect = CommandAdapter.Error(
            1, "This node is already part of a swarm"
        )

        result = runner.invoke(swarm, ["init"])

        assert result.exit_code == 1
        assert "This node is already part of a swarm" in result.output

    def test_init_socket_fallback(self, runner, command_adapter, input_adapter, socket, secrets):
        # Mock socket behavior to fail connection
        mock_socket_instance = socket.socket.return_value
        mock_socket_instance.connect.side_effect = Exception(
            "Connection failed")
        mock_socket_instance.getsockname.return_value = ("127.0.0.1", 12345)

        # Mock password inputs for secret creation
        input_adapter.password.side_effect = [
            "db_password",
            "root_password",
            "grafana_admin_password",
            "jwt_secret"
        ]

        worker_token = "SWMTKN-1-xxxx"
        manager_token = "SWMTKN-1-yyyy"
        manager_ip = "127.0.0.1"

        command_adapter.run.side_effect = [
            [],  # docker swarm init returns empty stdout when successful
            [],  # docker secret create db_password
            [],  # docker secret create grafana_admin_password
            [],  # docker secret create jwt_secret
            [],  # docker secret create root_password
            [
                "To add a worker to this swarm, run the following command:",
                "",
                f"    docker swarm join --token {worker_token} {manager_ip}:2377"
            ],
            [
                "To add a manager to this swarm, run the following command:",
                "",
                f"    docker swarm join --token {manager_token} {manager_ip}:2377"
            ]
        ]

        result = runner.invoke(swarm, ["init"])

        assert result.exit_code == 0
        # Verify that docker swarm init was called with fallback IP
        assert command_adapter.run.call_args_list[0][0][0] == [
            "docker", "swarm", "init", "--advertise-addr", "127.0.0.1"
        ]

    def test_init_with_empty_jwt_secret(self, runner, command_adapter, input_adapter, socket, secrets):
        """Test automatic JWT secret generation when user provides empty input."""
        # Mock socket behavior
        mock_socket_instance = socket.socket.return_value
        mock_socket_instance.getsockname.return_value = (
            "192.168.1.100", 12345)

        # Mock password inputs with empty JWT secret
        input_adapter.password.side_effect = [
            "db_password",
            "root_password",
            "grafana_admin_password",
            ""  # Empty JWT secret should trigger random generation
        ]

        worker_token = "SWMTKN-1-xxxx"
        manager_token = "SWMTKN-1-yyyy"
        manager_ip = "192.168.1.100"

        command_adapter.run.side_effect = [
            [],  # docker swarm init returns empty stdout when successful
            [],  # docker secret create db_password
            [],  # docker secret create grafana_admin_password
            [],  # docker secret create jwt_secret (with random value)
            [],  # docker secret create root_password
            [
                "To add a worker to this swarm, run the following command:",
                "",
                f"    docker swarm join --token {worker_token} {manager_ip}:2377"
            ],
            [
                "To add a manager to this swarm, run the following command:",
                "",
                f"    docker swarm join --token {manager_token} {manager_ip}:2377"
            ]
        ]

        result = runner.invoke(swarm, ["init"])

        assert result.exit_code == 0

        # Verify that secrets.token_urlsafe was called to generate random JWT secret
        secrets.token_urlsafe.assert_called_once_with(32)

        # Verify that the jwt_secret was created with the random value
        jwt_secret_call = command_adapter.run.call_args_list[3]
        assert jwt_secret_call[0][0] == [
            "docker", "secret", "create", "jwt_secret", "-"]
        assert jwt_secret_call[1]["input"] == "random_jwt_secret_123"

    def test_init_other_error(self, runner, command_adapter, input_adapter, socket, secrets):
        # Mock socket behavior
        mock_socket_instance = socket.socket.return_value
        mock_socket_instance.getsockname.return_value = (
            "192.168.1.100", 12345)

        # Mock CommandAdapter.Error for a different error (not "already part of a swarm")
        from cli.util.command_adapter import CommandAdapter
        command_adapter.run.side_effect = CommandAdapter.Error(
            1, "Docker daemon is not running"
        )

        result = runner.invoke(swarm, ["init"])

        assert result.exit_code == 1
        # The original CommandAdapter.Error should be re-raised
        assert "Docker daemon is not running" in str(result.exception)

    def test_info(self, runner, command_adapter, input_adapter, socket):
        worker_token = "SWMTKN-1-worker-token"
        manager_token = "SWMTKN-1-manager-token"
        manager_ip = "192.168.1.100"

        # Mock the two command_adapter.run calls for info command
        command_adapter.run.side_effect = [
            [
                "To add a worker to this swarm, run the following command:",
                "",
                f"    docker swarm join --token {worker_token} {manager_ip}:2377"
            ],
            [
                "To add a manager to this swarm, run the following command:",
                "",
                f"    docker swarm join --token {manager_token} {manager_ip}:2377"
            ]
        ]

        result = runner.invoke(swarm, ["info"])

        assert result.exit_code == 0
        assert f"Worker Token: {worker_token}" in result.output
        assert f"Manager Token: {manager_token}" in result.output
        assert f"Manager IP: {manager_ip}" in result.output

    def test_info_invalid_tokens(self, runner, command_adapter, input_adapter, socket):
        # Mock invalid output that doesn't match the regex patterns
        # Need at least 3 elements since the code accesses [2]
        command_adapter.run.side_effect = [
            ["Invalid worker output", "", "No valid join command here"],
            ["Invalid manager output", "", "No valid join command here"]
        ]

        result = runner.invoke(swarm, ["info"])

        assert result.exit_code == 1
        assert "Could not get swarm join tokens" in result.output

    def test_info_not_swarm_manager(self, runner, command_adapter, input_adapter, socket):
        command_adapter.run.side_effect = CommandAdapter.Error(
            1, "This node is not a swarm manager")

        result = runner.invoke(swarm, ["info"])

        assert result.exit_code == 1
        assert "This node is not a swarm manager" in result.output

    def test_info_other_error(self, runner, command_adapter, input_adapter, socket):
        command_adapter.run.side_effect = CommandAdapter.Error(
            1, "Some other error")

        result = runner.invoke(swarm, ["info"])

        assert result.exit_code == 1

    def test_join(self, runner, command_adapter, input_adapter, socket):
        token = "SWMTKN-1-test-token"
        manager_ip = "192.168.1.100"

        # Mock input adapter
        input_adapter.text.side_effect = [token, manager_ip]

        result = runner.invoke(swarm, ["join"])

        assert result.exit_code == 0
        command_adapter.run.assert_called_once_with([
            "docker", "swarm", "join", "--token", token, f"{manager_ip}:2377"
        ])

    def test_join_already_in_swarm(self, runner, command_adapter, input_adapter, socket):
        token = "SWMTKN-1-test-token"
        manager_ip = "192.168.1.100"

        # Mock input adapter
        input_adapter.text.side_effect = [token, manager_ip]

        # Mock CommandAdapter.Error for already in swarm scenario
        from cli.util.command_adapter import CommandAdapter
        command_adapter.run.side_effect = CommandAdapter.Error(
            1, "This node is already part of a swarm"
        )

        result = runner.invoke(swarm, ["join"])

        assert result.exit_code == 1
        assert "This node is already part of a swarm" in result.output

    def test_leave(self, runner, command_adapter, input_adapter, socket):
        result = runner.invoke(swarm, ["leave"])

        assert result.exit_code == 0
        command_adapter.run.assert_called_once_with([
            "docker", "swarm", "leave", "--force"
        ])

    def test_leave_not_in_swarm(self, runner, command_adapter, input_adapter, socket):
        # Mock CommandAdapter.Error for not in swarm scenario
        from cli.util.command_adapter import CommandAdapter
        command_adapter.run.side_effect = CommandAdapter.Error(
            1, "This node is not part of a swarm"
        )

        result = runner.invoke(swarm, ["leave"])

        assert result.exit_code == 1
        assert "This node is not part of a swarm" in result.output

    def test_join_other_error(self, runner, command_adapter, input_adapter, socket):
        token = "SWMTKN-1-test-token"
        manager_ip = "192.168.1.100"

        # Mock input adapter
        input_adapter.text.side_effect = [token, manager_ip]

        # Mock CommandAdapter.Error for a different error (not "already part of a swarm")
        from cli.util.command_adapter import CommandAdapter
        command_adapter.run.side_effect = CommandAdapter.Error(
            1, "Invalid join token"
        )

        result = runner.invoke(swarm, ["join"])

        assert result.exit_code == 1
        # The original CommandAdapter.Error should be re-raised
        assert "Invalid join token" in str(result.exception)

    def test_leave_other_error(self, runner, command_adapter, input_adapter, socket):
        # Mock CommandAdapter.Error for a different error (not "not part of a swarm")
        from cli.util.command_adapter import CommandAdapter
        command_adapter.run.side_effect = CommandAdapter.Error(
            1, "Docker daemon is not running"
        )

        result = runner.invoke(swarm, ["leave"])

        assert result.exit_code == 1
        # The original CommandAdapter.Error should be re-raised
        assert "Docker daemon is not running" in str(result.exception)
