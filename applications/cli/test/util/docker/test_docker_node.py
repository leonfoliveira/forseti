from unittest.mock import MagicMock
import pytest

from cli.util.docker.docker_node import DockerNode


class TestDockerNode:
    @pytest.fixture
    def mock_node(self):
        mock_node = MagicMock()
        mock_node.id = "node123"
        mock_node.attrs = {
            "Description": {
                "Hostname": "worker-01"
            },
            "Status": {
                "Addr": "192.168.1.100",
                "State": "ready"
            },
            "Spec": {
                "Role": "worker",
                "Availability": "active"
            }
        }
        return mock_node

    @pytest.fixture
    def docker_node(self, mock_node):
        return DockerNode(mock_node)

    def test_init(self, mock_node):
        """Test DockerNode initialization"""
        node = DockerNode(mock_node)
        assert node.node == mock_node

    def test_id_property(self, docker_node):
        """Test id property"""
        assert docker_node.id == "node123"

    def test_hostname_property(self, docker_node):
        """Test hostname property"""
        assert docker_node.hostname == "worker-01"

    def test_address_property(self, docker_node):
        """Test address property"""
        assert docker_node.address == "192.168.1.100"

    def test_role_property(self, docker_node):
        """Test role property"""
        assert docker_node.role == "worker"

    def test_state_property(self, docker_node):
        """Test state property"""
        assert docker_node.state == "ready"

    def test_availability_property(self, docker_node):
        """Test availability property"""
        assert docker_node.availability == "active"

    def test_manager_node(self, mock_node):
        """Test DockerNode with manager role"""
        mock_node.attrs["Spec"]["Role"] = "manager"
        mock_node.attrs["Status"]["State"] = "ready"

        node = DockerNode(mock_node)

        assert node.role == "manager"
        assert node.state == "ready"

    def test_down_node(self, mock_node):
        """Test DockerNode with down state"""
        mock_node.attrs["Status"]["State"] = "down"
        mock_node.attrs["Spec"]["Availability"] = "drain"

        node = DockerNode(mock_node)

        assert node.state == "down"
        assert node.availability == "drain"

    def test_different_hostnames(self, mock_node):
        """Test DockerNode with different hostname formats"""
        test_hostnames = [
            "manager-01",
            "worker.example.com",
            "node123",
            "swarm-leader"
        ]

        for hostname in test_hostnames:
            mock_node.attrs["Description"]["Hostname"] = hostname
            node = DockerNode(mock_node)
            assert node.hostname == hostname

    def test_different_addresses(self, mock_node):
        """Test DockerNode with different address formats"""
        test_addresses = [
            "192.168.1.100",
            "10.0.0.5",
            "172.16.1.50",
            "node1.example.com"
        ]

        for address in test_addresses:
            mock_node.attrs["Status"]["Addr"] = address
            node = DockerNode(mock_node)
            assert node.address == address

    def test_node_states(self, mock_node):
        """Test DockerNode with different states"""
        test_states = ["ready", "down", "unknown", "disconnected"]

        for state in test_states:
            mock_node.attrs["Status"]["State"] = state
            node = DockerNode(mock_node)
            assert node.state == state

    def test_availability_states(self, mock_node):
        """Test DockerNode with different availability states"""
        test_availability = ["active", "pause", "drain"]

        for availability in test_availability:
            mock_node.attrs["Spec"]["Availability"] = availability
            node = DockerNode(mock_node)
            assert node.availability == availability
