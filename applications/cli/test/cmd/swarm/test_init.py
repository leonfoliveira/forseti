from unittest.mock import patch, MagicMock
import pytest
from typer.testing import CliRunner

from cli.cmd import app

PACKAGE = "cli.cmd.swarm.init"


class TestSwarmInit:
    @pytest.fixture
    def runner(self):
        return CliRunner()

    @pytest.fixture(autouse=True)
    def mock_docker_swarm(self):
        with patch(f"{PACKAGE}.DockerSwarm") as mock_docker_swarm:
            mock_swarm = mock_docker_swarm.return_value
            mock_swarm.is_active = False
            mock_swarm.init = MagicMock()
            mock_swarm.create_secret = MagicMock()
            yield mock_swarm

    @pytest.fixture(autouse=True)
    def mock_typer_prompt(self):
        with patch(f"{PACKAGE}.typer.prompt") as mock_prompt:
            mock_prompt.return_value = "testpassword123"
            yield mock_prompt

    def test_init_already_in_swarm(self, runner, mock_docker_swarm):
        """Test init when node is already in swarm"""
        mock_docker_swarm.is_active = True
        result = runner.invoke(app, ["swarm", "init"])

        assert result.exit_code == 1
        assert "This node is already part of a swarm" in result.output
        mock_docker_swarm.init.assert_not_called()

    def test_init_success(self, runner, mock_docker_swarm, mock_typer_prompt):
        """Test successful swarm initialization"""
        result = runner.invoke(app, ["swarm", "init"])

        assert result.exit_code == 0
        assert "Swarm initialized successfully!" in result.output
        mock_docker_swarm.init.assert_called_once_with(advertise_addr="eth0")
        assert mock_docker_swarm.create_secret.call_count == 5  # 5 secrets created

    def test_init_with_custom_advertise_addr(self, runner, mock_docker_swarm):
        """Test init with custom advertise address"""
        result = runner.invoke(
            app, ["swarm", "init", "--advertise-addr", "192.168.1.100"])

        assert result.exit_code == 0
        mock_docker_swarm.init.assert_called_once_with(
            advertise_addr="192.168.1.100")

    def test_init_with_docker_swarm_exception(self, runner, mock_docker_swarm):
        """Test init when docker swarm fails"""
        mock_docker_swarm.init.side_effect = Exception("Swarm init failed")

        result = runner.invoke(app, ["swarm", "init"])

        assert result.exit_code != 0
        mock_docker_swarm.init.assert_called_once()

    def test_password_validation(self, runner, mock_docker_swarm):
        """Test that password validation works correctly"""
        with patch(f"{PACKAGE}.typer.prompt") as mock_prompt:
            # First call returns short password, second returns valid password
            mock_prompt.side_effect = ["short", "validpassword123"]

            result = runner.invoke(app, ["swarm", "init"])

            # Should prompt twice for the first password due to validation
            assert mock_prompt.call_count > 1
