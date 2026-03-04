from unittest.mock import patch, MagicMock
import pytest
from typer.testing import CliRunner

from cli.cmd import app

PACKAGE = "cli.cmd.swarm.info"


class TestSwarmInfo:
    @pytest.fixture
    def runner(self):
        return CliRunner()

    @pytest.fixture(autouse=True)
    def mock_docker_swarm(self):
        with patch(f"{PACKAGE}.DockerSwarm") as mock_docker_swarm:
            mock_swarm = mock_docker_swarm.return_value
            mock_swarm.is_active = True
            mock_swarm.local_node_state = "active"
            mock_swarm.manager_address = "192.168.1.100:2377"
            mock_swarm.worker_join_token = "SWMTKN-1-worker-token"
            mock_swarm.manager_join_token = "SWMTKN-1-manager-token"

            # Mock nodes
            mock_node1 = MagicMock()
            mock_node1.id = "node1id"
            mock_node1.hostname = "manager1"
            mock_node1.address = "192.168.1.100"
            mock_node1.role = "manager"
            mock_node1.state = "ready"

            mock_node2 = MagicMock()
            mock_node2.id = "node2id"
            mock_node2.hostname = "worker1"
            mock_node2.address = "192.168.1.101"
            mock_node2.role = "worker"
            mock_node2.state = "ready"

            mock_swarm.nodes = [mock_node1, mock_node2]
            yield mock_swarm

    def test_info_swarm_active(self, runner, mock_docker_swarm):
        """Test info when swarm is active"""
        result = runner.invoke(app, ["swarm", "info"])

        assert result.exit_code == 0
        assert "Swarm State: active" in result.output
        assert "Manager Address: 192.168.1.100:2377" in result.output
        assert "Worker Join Token: SWMTKN-1-worker-token" in result.output
        assert "Manager Join Token: SWMTKN-1-manager-token" in result.output
        assert "Swarm Nodes" in result.output
        assert "manager1" in result.output
        assert "worker1" in result.output

    def test_info_swarm_inactive(self, runner, mock_docker_swarm):
        """Test info when swarm is inactive"""
        mock_docker_swarm.is_active = False
        mock_docker_swarm.local_node_state = "inactive"

        result = runner.invoke(app, ["swarm", "info"])

        assert result.exit_code == 0
        assert "Swarm State: inactive" in result.output
        # Should not show tokens or nodes table when inactive
        assert "Manager Address:" not in result.output
        assert "Worker Join Token:" not in result.output
        assert "Swarm Nodes" not in result.output

    def test_info_node_states_and_roles(self, runner, mock_docker_swarm):
        """Test that node roles and states are displayed with correct styling"""
        # Add a node with different state
        mock_node_down = MagicMock()
        mock_node_down.id = "node3id"
        mock_node_down.hostname = "worker2"
        mock_node_down.address = "192.168.1.102"
        mock_node_down.role = "worker"
        mock_node_down.state = "down"

        mock_docker_swarm.nodes = mock_docker_swarm.nodes + [mock_node_down]

        result = runner.invoke(app, ["swarm", "info"])

        assert result.exit_code == 0
        # Check that different roles and states are present
        assert "manager" in result.output
        assert "worker" in result.output
        assert "ready" in result.output
        assert "down" in result.output

    def test_info_docker_exception(self, runner):
        """Test info when docker operation fails"""
        with patch(f"{PACKAGE}.DockerSwarm") as mock_docker_swarm_class:
            mock_docker_swarm_class.side_effect = Exception(
                "Docker connection failed")

            result = runner.invoke(app, ["swarm", "info"])

            assert result.exit_code != 0
