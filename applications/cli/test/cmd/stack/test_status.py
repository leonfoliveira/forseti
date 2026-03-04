from unittest.mock import patch, MagicMock
import pytest
from typer.testing import CliRunner

from cli.cmd import app

PACKAGE = "cli.cmd.stack.status"


class TestStackStatus:
    @pytest.fixture
    def runner(self):
        return CliRunner()

    @pytest.fixture(autouse=True)
    def mock_docker_swarm(self):
        with patch(f"{PACKAGE}.DockerSwarm") as mock_docker_swarm:
            mock_swarm = mock_docker_swarm.return_value
            mock_swarm.is_active = True
            yield mock_swarm

    @pytest.fixture(autouse=True)
    def mock_docker_stack(self):
        with patch(f"{PACKAGE}.DockerStack") as mock_docker_stack:
            mock_stack = mock_docker_stack.return_value

            # Mock services with tasks
            mock_service = MagicMock()
            mock_service.name = "test_service"
            mock_service.running_replicas = 2
            mock_service.desired_replicas = 2
            mock_service.mode = "replicated"

            mock_task = MagicMock()
            mock_task.container_id = "container123"
            mock_task.state = "running"
            mock_task.has_health_check = True
            mock_task.health_status = "healthy"
            mock_node = MagicMock()
            mock_node.hostname = "node1"
            mock_task.node = mock_node

            mock_service.tasks = [mock_task]
            mock_stack.services = [mock_service]

            yield mock_stack

    @pytest.fixture(autouse=True)
    def mock_build_table(self):
        with patch(f"{PACKAGE}.build_table") as mock_build_table:
            mock_table = MagicMock(
                __str__=lambda self: "Status Table"
            )
            mock_build_table.return_value = mock_table
            yield mock_build_table

    @pytest.fixture(autouse=True)
    def mock_sleep(self):
        with patch(f"{PACKAGE}.sleep") as mock_sleep:
            yield mock_sleep

    def test_status_not_deployed(self, runner, mock_docker_stack):
        """Test status when stack is not deployed"""
        mock_docker_stack.is_deployed = False
        result = runner.invoke(app, ["stack", "status"])

        assert result.exit_code == 1
        assert "Stack is not deployed" in result.output

    def test_status_success(self, runner, mock_build_table):
        """Test successful status display"""
        result = runner.invoke(app, ["stack", "status"])

        assert result.exit_code == 0
        mock_build_table.assert_called()

    def test_status_not_in_swarm(self, runner, mock_docker_swarm):
        """Test status when node is not in swarm"""
        mock_docker_swarm.is_active = False
        result = runner.invoke(app, ["stack", "status"])

        assert result.exit_code == 1
        assert "This node is not part of a swarm" in result.output

    def test_status_with_service_filter(self, runner, mock_docker_stack, mock_build_table):
        """Test status with service filter"""
        result = runner.invoke(
            app, ["stack", "status", "--service", "test_service"])

        assert result.exit_code == 0
        mock_build_table.assert_called_with(mock_docker_stack, "test_service")

    def test_status_follow_mode(self, runner, mock_build_table, mock_sleep):
        """Test status in follow mode (with keyboard interrupt)"""
        # Mock KeyboardInterrupt after first iteration
        mock_sleep.side_effect = KeyboardInterrupt()

        result = runner.invoke(app, ["stack", "status", "--follow"])

        # Should exit gracefully on KeyboardInterrupt
        assert result.exit_code == 1  # CliRunner treats KeyboardInterrupt as exit code 1
        mock_build_table.assert_called()


class TestBuildTable:
    @pytest.fixture(autouse=True)
    def mock_table(self):
        with patch("cli.cmd.stack.status.Table") as mock_table:
            yield mock_table

    @pytest.fixture(autouse=True)
    def mock_messages(self):
        with patch("cli.cmd.stack.status.Messages") as mock_messages:
            mock_messages.service_name.return_value = "service_name"
            mock_messages.container_id.return_value = "container_id"
            mock_messages.node_name.return_value = "node_name"
            yield mock_messages

    def test_build_table_basic(self, mock_table, mock_messages):
        """Test basic table building"""
        from cli.cmd.stack.status import build_table

        mock_stack = MagicMock()
        mock_service = MagicMock()
        mock_service.name = "test_service"
        mock_service.running_replicas = 1
        mock_service.desired_replicas = 1
        mock_service.mode = "replicated"
        mock_service.tasks = []
        mock_stack.services = [mock_service]

        result = build_table(mock_stack)

        assert mock_table.called
        mock_table.assert_called_with(title="Status")
