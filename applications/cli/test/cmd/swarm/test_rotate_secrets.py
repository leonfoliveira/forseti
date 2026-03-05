from unittest.mock import patch, MagicMock
import pytest
from typer.testing import CliRunner

from cli.cmd import app

PACKAGE = "cli.cmd.swarm.rotate_secrets"


class TestRotateSecrets:
    @pytest.fixture
    def runner(self):
        return CliRunner()

    @pytest.fixture(autouse=True)
    def mock_docker_swarm(self):
        with patch(f"{PACKAGE}.DockerSwarm") as mock_docker_swarm:
            mock_swarm = mock_docker_swarm.return_value
            mock_swarm.is_active = True
            mock_swarm.create_secret = MagicMock()
            yield mock_swarm

    @pytest.fixture(autouse=True)
    def mock_docker_stack(self):
        with patch(f"{PACKAGE}.DockerStack") as mock_docker_stack:
            mock_stack = mock_docker_stack.return_value
            mock_stack.is_deployed = True
            yield mock_stack

    @pytest.fixture(autouse=True)
    def mock_typer_prompt(self):
        with patch(f"{PACKAGE}.typer.prompt") as mock_prompt:
            mock_prompt.return_value = "validpassword123"
            yield mock_prompt

    @pytest.fixture(autouse=True)
    def mock_time(self):
        with patch(f"{PACKAGE}.time") as mock_time:
            mock_time.return_value = 1234567890
            yield mock_time

    @pytest.fixture(autouse=True)
    def mock_deploy_cmd(self):
        with patch(f"{PACKAGE}.deploy_cmd") as mock_deploy:
            yield mock_deploy

    @pytest.fixture(autouse=True)
    def mock_console(self):
        with patch(f"{PACKAGE}.console") as mock_console:
            yield mock_console

    def test_rotate_secrets_not_in_swarm(self, runner, mock_docker_swarm, mock_deploy_cmd):
        """Test rotate secrets when node is not in swarm"""
        mock_docker_swarm.is_active = False
        result = runner.invoke(app, ["swarm", "rotate-secrets"])

        assert result.exit_code == 1
        mock_docker_swarm.create_secret.assert_not_called()
        mock_deploy_cmd.assert_not_called()

    def test_rotate_secrets_stack_deployed_success(self, runner, mock_docker_swarm,
                                                   mock_docker_stack, mock_deploy_cmd,
                                                   mock_typer_prompt, mock_time):
        """Test successful secret rotation when stack is deployed"""
        mock_docker_stack.is_deployed = True

        result = runner.invoke(app, ["swarm", "rotate-secrets"])

        assert result.exit_code == 0
        # Verify all 5 secrets are created with correct timestamp
        assert mock_docker_swarm.create_secret.call_count == 5

        # Verify secrets are created with correct parameters
        expected_secrets = ["root_password", "db_password", "redis_password",
                            "minio_password", "rabbitmq_password"]

        for i, expected_name in enumerate(expected_secrets):
            call_kwargs = mock_docker_swarm.create_secret.call_args_list[i][1]
            assert call_kwargs["name"] == expected_name
            assert call_kwargs["version"] == 1234567890
            assert call_kwargs["data"] == "validpassword123"

        # Deploy should be called when stack is deployed
        mock_deploy_cmd.assert_called_once_with(yes=True, force=True)

    def test_rotate_secrets_stack_not_deployed(self, runner, mock_docker_swarm,
                                               mock_docker_stack, mock_deploy_cmd):
        """Test secret rotation when stack is not deployed"""
        mock_docker_stack.is_deployed = False

        result = runner.invoke(app, ["swarm", "rotate-secrets"])

        assert result.exit_code == 0
        # Secrets should still be created
        assert mock_docker_swarm.create_secret.call_count == 5
        # Deploy should not be called when stack is not deployed
        mock_deploy_cmd.assert_not_called()

    def test_password_validation_too_short(self, runner, mock_docker_swarm):
        """Test password validation for passwords that are too short"""
        with patch(f"{PACKAGE}.typer.prompt") as mock_prompt:
            # First call returns short password, second returns valid password
            mock_prompt.side_effect = ["short", "validpass123", "validpass123",
                                       "validpass123", "validpass123", "validpass123"]

            result = runner.invoke(app, ["swarm", "rotate-secrets"])

            # Should prompt multiple times for the first password due to validation
            assert mock_prompt.call_count == 6  # 1 retry + 5 valid passwords
            assert result.exit_code == 0

    def test_password_validation_too_long(self, runner, mock_docker_swarm):
        """Test password validation for passwords that are too long"""
        with patch(f"{PACKAGE}.typer.prompt") as mock_prompt:
            long_password = "a" * 31  # 31 characters, exceeds 30 limit
            mock_prompt.side_effect = [long_password, "validpass123", "validpass123",
                                       "validpass123", "validpass123", "validpass123"]

            result = runner.invoke(app, ["swarm", "rotate-secrets"])

            # Should prompt multiple times for the first password due to validation
            assert mock_prompt.call_count == 6  # 1 retry + 5 valid passwords
            assert result.exit_code == 0

    def test_password_validation_edge_cases(self, runner, mock_docker_swarm):
        """Test password validation for edge case lengths"""
        with patch(f"{PACKAGE}.typer.prompt") as mock_prompt:
            # Test minimum length (8 chars) and maximum length (30 chars)
            min_password = "12345678"  # 8 characters
            max_password = "a" * 30   # 30 characters
            mock_prompt.side_effect = [min_password, max_password, min_password,
                                       max_password, min_password]

            result = runner.invoke(app, ["swarm", "rotate-secrets"])

            assert mock_prompt.call_count == 5
            assert result.exit_code == 0

    def test_secrets_created_with_correct_names_and_timestamp(self, runner, mock_docker_swarm, mock_time):
        """Test that secrets are created with correct names and timestamps"""
        mock_time.return_value = 9999999999

        result = runner.invoke(app, ["swarm", "rotate-secrets"])

        assert result.exit_code == 0

        # Verify secret names and timestamp
        expected_secrets = ["root_password", "db_password", "redis_password",
                            "minio_password", "rabbitmq_password"]

        for i, expected_name in enumerate(expected_secrets):
            call_kwargs = mock_docker_swarm.create_secret.call_args_list[i][1]
            assert call_kwargs["name"] == expected_name

        # Verify all secrets use the same timestamp
        for call in mock_docker_swarm.create_secret.call_args_list:
            assert call[1]["version"] == 9999999999

    def test_different_passwords_for_each_secret(self, runner, mock_docker_swarm):
        """Test that different passwords can be provided for each secret"""
        with patch(f"{PACKAGE}.typer.prompt") as mock_prompt:
            passwords = ["rootpass123", "dbpass123", "redispass123",
                         "miniopass123", "rabbitmqpass123"]
            mock_prompt.side_effect = passwords

            result = runner.invoke(app, ["swarm", "rotate-secrets"])

            assert result.exit_code == 0
            assert mock_prompt.call_count == 5

            # Verify each secret gets its corresponding password
            for i, expected_password in enumerate(passwords):
                call_kwargs = mock_docker_swarm.create_secret.call_args_list[i][1]
                assert call_kwargs["data"] == expected_password
