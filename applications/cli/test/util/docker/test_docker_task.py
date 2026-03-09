from unittest.mock import patch, MagicMock
import pytest
from docker.errors import APIError, NotFound

from cli.util.docker.docker_task import DockerTask

PACKAGE = "cli.util.docker.docker_task"


class TestDockerTask:
    @pytest.fixture
    def mock_swarm(self):
        return MagicMock()

    @pytest.fixture
    def mock_stack(self):
        return MagicMock()

    @pytest.fixture
    def mock_service(self):
        return MagicMock()

    @pytest.fixture
    def mock_docker_task(self):
        return {
            "Status": {
                "State": "running",
                "ContainerStatus": {
                    "ContainerID": "container123"
                }
            },
            "NodeID": "node123"
        }

    @pytest.fixture
    def mock_container(self):
        container = MagicMock()
        container.id = "container123456789"
        container.attrs = {
            "State": {
                "Health": {
                    "Status": "healthy"
                }
            }
        }
        return container

    @pytest.fixture
    def mock_node(self):
        node = MagicMock()
        node.id = "node123"
        return node

    @pytest.fixture(autouse=True)
    def mock_docker_client(self):
        with patch(f"{PACKAGE}.get_docker_client") as mock_get_docker_client:
            mock_docker_client = MagicMock()
            mock_get_docker_client.return_value = mock_docker_client
            mock_container = MagicMock()
            mock_container.id = "container123456789"
            mock_container.attrs = {
                "State": {
                    "Health": {
                        "Status": "healthy"
                    }
                }
            }
            mock_docker_client.containers.get.return_value = mock_container
            yield mock_docker_client

    def test_init(self, mock_swarm, mock_stack, mock_service, mock_docker_task):
        """Test DockerTask initialization"""
        mock_swarm.nodes = [MagicMock(id="node123")]

        task = DockerTask(mock_swarm, mock_stack,
                          mock_service, mock_docker_task)

        assert task.swarm == mock_swarm
        assert task.stack == mock_stack
        assert task.service == mock_service
        assert task.docker_task == mock_docker_task

    def test_init_with_node_matching(self, mock_swarm, mock_stack, mock_service, mock_docker_task):
        """Test DockerTask initialization with node matching"""
        mock_node = MagicMock()
        mock_node.id = "node123"
        mock_swarm.nodes = [mock_node]

        task = DockerTask(mock_swarm, mock_stack,
                          mock_service, mock_docker_task)

        assert task.node == mock_node

    def test_init_no_node_match(self, mock_swarm, mock_stack, mock_service, mock_docker_task):
        """Test DockerTask initialization when no node matches"""
        mock_swarm.nodes = [MagicMock(id="different_node")]

        task = DockerTask(mock_swarm, mock_stack,
                          mock_service, mock_docker_task)

        assert task.node is None

    def test_state_property(self, mock_swarm, mock_stack, mock_service, mock_docker_task):
        """Test state property"""
        mock_swarm.nodes = []
        task = DockerTask(mock_swarm, mock_stack,
                          mock_service, mock_docker_task)

        assert task.state == "running"

    def test_state_property_missing(self, mock_swarm, mock_stack, mock_service):
        """Test state property when Status is missing"""
        mock_swarm.nodes = []
        docker_task = {}

        task = DockerTask(mock_swarm, mock_stack, mock_service, docker_task)

        assert task.state == "unknown"

    def test_is_running_true(self, mock_swarm, mock_stack, mock_service, mock_docker_task):
        """Test is_running when task is running"""
        mock_swarm.nodes = []

        task = DockerTask(mock_swarm, mock_stack,
                          mock_service, mock_docker_task)

        assert task.is_running is True

    def test_is_running_false(self, mock_swarm, mock_stack, mock_service, mock_docker_task):
        """Test is_running when task is not running"""
        mock_swarm.nodes = []
        mock_docker_task["Status"]["State"] = "failed"

        task = DockerTask(mock_swarm, mock_stack,
                          mock_service, mock_docker_task)

        assert task.is_running is False

    def test_container_id_with_container(self, mock_swarm, mock_stack, mock_service, mock_docker_task):
        """Test container_id property with valid container"""
        mock_swarm.nodes = []

        task = DockerTask(mock_swarm, mock_stack,
                          mock_service, mock_docker_task)

        # Should return first 12 characters
        assert task.container_id == "container123"

    def test_container_id_no_container(self, mock_swarm, mock_stack, mock_service):
        """Test container_id property with no container"""
        mock_swarm.nodes = []
        docker_task = {"Status": {}}

        task = DockerTask(mock_swarm, mock_stack, mock_service, docker_task)

        assert task.container_id == ""

    def test_different_task_states(self, mock_swarm, mock_stack, mock_service):
        """Test different task states"""
        mock_swarm.nodes = []
        test_states = ["new", "pending", "assigned", "accepted", "preparing",
                       "starting", "running", "complete", "shutdown", "failed", "rejected"]

        for state in test_states:
            docker_task = {"Status": {"State": state}}
            task = DockerTask(mock_swarm, mock_stack,
                              mock_service, docker_task)
            assert task.state == state
            assert task.is_running == (state == "running")
