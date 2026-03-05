from unittest.mock import patch, MagicMock
import pytest

from cli.util.docker.docker_swarm import DockerSwarm

PACKAGE = "cli.util.docker.docker_swarm"


class TestDockerSwarm:
    @pytest.fixture
    def docker_swarm(self):
        return DockerSwarm()

    @pytest.fixture(autouse=True)
    def mock_docker_client(self):
        with patch(f"{PACKAGE}.get_docker_client") as mock_get_docker_client:
            mock_docker_client = MagicMock()
            mock_get_docker_client.return_value = mock_docker_client

            # Default mock setup for active swarm
            mock_docker_client.info.return_value = {
                "Swarm": {
                    "LocalNodeState": "active",
                    "NodeID": "node123"
                }
            }

            # Mock swarm object
            mock_swarm = MagicMock()
            mock_swarm.attrs = {
                "JoinTokens": {
                    "Manager": "SWMTKN-1-manager-token",
                    "Worker": "SWMTKN-1-worker-token"
                }
            }
            mock_docker_client.swarm = mock_swarm

            # Mock node
            mock_node = MagicMock()
            mock_node.attrs = {
                "ManagerStatus": {
                    "Addr": "192.168.1.100:2377"
                }
            }
            mock_docker_client.nodes.get.return_value = mock_node
            mock_docker_client.nodes.list.return_value = [mock_node]

            # Mock secrets and other operations
            mock_docker_client.secrets.create = MagicMock()
            mock_docker_client.swarm.init = MagicMock()
            mock_docker_client.swarm.join = MagicMock()
            mock_docker_client.swarm.leave = MagicMock()

            yield mock_docker_client

    def test_is_active_true(self, docker_swarm, mock_docker_client):
        """Test is_active property when swarm is active"""
        assert docker_swarm.is_active is True

    def test_is_active_false(self, docker_swarm, mock_docker_client):
        """Test is_active property when swarm is inactive"""
        mock_docker_client.info.return_value = {
            "Swarm": {"LocalNodeState": "inactive"}
        }

        assert docker_swarm.is_active is False

    def test_local_node_state_active(self, docker_swarm, mock_docker_client):
        """Test local_node_state property when active"""
        assert docker_swarm.local_node_state == "active"

    def test_local_node_state_inactive(self, docker_swarm, mock_docker_client):
        """Test local_node_state property when inactive"""
        mock_docker_client.info.return_value = {
            "Swarm": {"LocalNodeState": "inactive"}
        }

        assert docker_swarm.local_node_state == "inactive"

    def test_local_node_state_missing_swarm_info(self, docker_swarm, mock_docker_client):
        """Test local_node_state property when swarm info is missing"""
        mock_docker_client.info.return_value = {}

        assert docker_swarm.local_node_state == "inactive"

    def test_manager_address(self, docker_swarm, mock_docker_client):
        """Test manager_address property"""
        address = docker_swarm.manager_address

        assert address == "192.168.1.100:2377"
        mock_docker_client.nodes.get.assert_called_once_with("node123")

    def test_manager_join_token(self, docker_swarm, mock_docker_client):
        """Test manager_join_token property"""
        token = docker_swarm.manager_join_token

        assert token == "SWMTKN-1-manager-token"

    def test_worker_join_token(self, docker_swarm, mock_docker_client):
        """Test worker_join_token property"""
        token = docker_swarm.worker_join_token

        assert token == "SWMTKN-1-worker-token"

    def test_nodes_property(self, docker_swarm, mock_docker_client):
        """Test nodes property"""
        with patch(f"{PACKAGE}.DockerNode") as mock_docker_node:
            mock_docker_node.return_value = "mocked_node"

            nodes = docker_swarm.nodes

            assert len(nodes) == 1
            assert nodes[0] == "mocked_node"
            mock_docker_node.assert_called_once()

    def test_init_swarm(self, docker_swarm, mock_docker_client):
        """Test swarm initialization"""
        docker_swarm.init("eth0")

        mock_docker_client.swarm.init.assert_called_once_with(
            advertise_addr="eth0")

    def test_init_swarm_with_ip(self, docker_swarm, mock_docker_client):
        """Test swarm initialization with IP address"""
        docker_swarm.init("192.168.1.100")

        mock_docker_client.swarm.init.assert_called_once_with(
            advertise_addr="192.168.1.100")

    def test_create_secret(self, docker_swarm, mock_docker_client):
        """Test secret creation"""
        docker_swarm.create_secret("test_secret", 123, "secret_data")

        mock_docker_client.secrets.create.assert_called_once_with(
            name="test_secret__123",
            data="secret_data"
        )

    def test_create_multiple_secrets(self, docker_swarm, mock_docker_client):
        """Test creating multiple secrets"""
        secrets = [
            ("db_password", "db_pass_123"),
            ("api_key", "api_key_456"),
            ("ssl_cert", "cert_data_789")
        ]

        for name, data in secrets:
            docker_swarm.create_secret(name, 123, data)

        assert mock_docker_client.secrets.create.call_count == 3

    def test_get_latest_secret(self, docker_swarm, mock_docker_client):
        """Test retrieving the latest version of a secret"""
        mock_secret_v1 = MagicMock()
        mock_secret_v1.name = "db_password__123"
        mock_secret_v2 = MagicMock()
        mock_secret_v2.name = "db_password__124"
        mock_docker_client.secrets.list.return_value = [
            mock_secret_v1, mock_secret_v2]

        latest_secret = docker_swarm.get_latest_secret("db_password")
        assert latest_secret == "db_password__124"

    def test_get_latest_secret_no_matching(self, docker_swarm, mock_docker_client):
        """Test get_latest_secret when no matching secrets are found"""
        mock_docker_client.secrets.list.return_value = []

        with pytest.raises(ValueError):
            docker_swarm.get_latest_secret("nonexistent_secret")

    def test_join_swarm(self, docker_swarm, mock_docker_client):
        """Test joining swarm"""
        token = "SWMTKN-1-test-token"
        manager_addr = "192.168.1.100:2377"

        docker_swarm.join(token, manager_addr)

        mock_docker_client.swarm.join.assert_called_once_with(
            remote_addrs=[manager_addr],
            join_token=token
        )

    def test_join_swarm_multiple_managers(self, docker_swarm, mock_docker_client):
        """Test joining swarm with multiple manager addresses"""
        token = "SWMTKN-1-test-token"
        manager_addr = "192.168.1.100:2377,192.168.1.101:2377"

        docker_swarm.join(token, manager_addr)

        mock_docker_client.swarm.join.assert_called_once_with(
            remote_addrs=[manager_addr],
            join_token=token
        )

    def test_leave_swarm(self, docker_swarm, mock_docker_client):
        """Test leaving swarm"""
        docker_swarm.leave()

        mock_docker_client.swarm.leave.assert_called_once_with(force=True)

    def test_docker_client_info_called(self, docker_swarm, mock_docker_client):
        """Test that docker client info is called when accessing properties"""
        # Access properties that should trigger info() calls
        _ = docker_swarm.is_active
        _ = docker_swarm.local_node_state

        # Should be called at least once for each property access
        assert mock_docker_client.info.call_count >= 1

    def test_error_handling_docker_unavailable(self, docker_swarm, mock_docker_client):
        """Test behavior when Docker is unavailable"""
        mock_docker_client.info.side_effect = Exception(
            "Docker daemon not available")

        with pytest.raises(Exception):
            _ = docker_swarm.is_active

    def test_error_handling_swarm_operations(self, docker_swarm, mock_docker_client):
        """Test error handling for swarm operations"""
        mock_docker_client.swarm.init.side_effect = Exception(
            "Swarm init failed")

        with pytest.raises(Exception):
            docker_swarm.init("eth0")

    def test_different_node_states(self, docker_swarm, mock_docker_client):
        """Test different local node states"""
        test_states = ["active", "inactive", "pending", "error"]

        for state in test_states:
            mock_docker_client.info.return_value = {
                "Swarm": {"LocalNodeState": state}
            }

            assert docker_swarm.local_node_state == state
            assert docker_swarm.is_active == (state == "active")
