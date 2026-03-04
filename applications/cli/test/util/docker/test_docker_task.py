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
        with patch(f"{PACKAGE}.docker_client") as mock_client:
            mock_container = MagicMock()
            mock_container.id = "container123456789"
            mock_container.attrs = {
                "State": {
                    "Health": {
                        "Status": "healthy"
                    }
                }
            }
            mock_client.containers.get.return_value = mock_container
            yield mock_client

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

    def test_get_container_success(self, mock_docker_client):
        """Test _get_container with valid container ID"""
        container = DockerTask._get_container("container123")

        assert container is not None
        mock_docker_client.containers.get.assert_called_once_with(
            "container123")

    def test_get_container_empty_id(self):
        """Test _get_container with empty container ID"""
        container = DockerTask._get_container("")
        assert container is None

    def test_get_container_none_id(self):
        """Test _get_container with None container ID"""
        container = DockerTask._get_container(None)
        assert container is None

    def test_get_container_not_found(self, mock_docker_client):
        """Test _get_container when container not found"""
        mock_docker_client.containers.get.side_effect = NotFound(
            "Container not found")

        container = DockerTask._get_container("nonexistent")
        assert container is None

    def test_get_container_api_error(self, mock_docker_client):
        """Test _get_container with API error"""
        mock_docker_client.containers.get.side_effect = APIError("API error")

        container = DockerTask._get_container("container123")
        assert container is None

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

    def test_has_health_check_true(self, mock_swarm, mock_stack, mock_service, mock_docker_task,
                                   mock_docker_client):
        """Test has_health_check when container has health check"""
        mock_swarm.nodes = []

        task = DockerTask(mock_swarm, mock_stack,
                          mock_service, mock_docker_task)

        assert task.has_health_check is True

    def test_has_health_check_no_container(self, mock_swarm, mock_stack, mock_service):
        """Test has_health_check when no container"""
        mock_swarm.nodes = []
        docker_task = {"Status": {}}

        task = DockerTask(mock_swarm, mock_stack, mock_service, docker_task)

        assert task.has_health_check is False

    def test_has_health_check_no_health(self, mock_swarm, mock_stack, mock_service, mock_docker_task,
                                        mock_docker_client):
        """Test has_health_check when container has no health check"""
        mock_swarm.nodes = []
        mock_container = MagicMock()
        mock_container.attrs = {"State": {}}
        mock_docker_client.containers.get.return_value = mock_container

        task = DockerTask(mock_swarm, mock_stack,
                          mock_service, mock_docker_task)

        assert task.has_health_check is False

    def test_health_status_healthy(self, mock_swarm, mock_stack, mock_service, mock_docker_task):
        """Test health_status property when healthy"""
        mock_swarm.nodes = []

        task = DockerTask(mock_swarm, mock_stack,
                          mock_service, mock_docker_task)

        assert task.health_status == "healthy"

    def test_health_status_no_container(self, mock_swarm, mock_stack, mock_service):
        """Test health_status when no container"""
        mock_swarm.nodes = []
        docker_task = {"Status": {}}

        task = DockerTask(mock_swarm, mock_stack, mock_service, docker_task)

        assert task.health_status is None

    def test_health_status_no_health(self, mock_swarm, mock_stack, mock_service, mock_docker_task,
                                     mock_docker_client):
        """Test health_status when no health check"""
        mock_swarm.nodes = []
        mock_container = MagicMock()
        mock_container.attrs = {"State": {}}
        mock_docker_client.containers.get.return_value = mock_container

        task = DockerTask(mock_swarm, mock_stack,
                          mock_service, mock_docker_task)

        assert task.health_status is None

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

    def test_is_healthy_running_with_health_check(self, mock_swarm, mock_stack, mock_service,
                                                  mock_docker_task):
        """Test is_healthy when running and healthy"""
        mock_swarm.nodes = []

        task = DockerTask(mock_swarm, mock_stack,
                          mock_service, mock_docker_task)

        assert task.is_healthy is True

    def test_is_healthy_not_running(self, mock_swarm, mock_stack, mock_service, mock_docker_task):
        """Test is_healthy when not running"""
        mock_swarm.nodes = []
        mock_docker_task["Status"]["State"] = "failed"

        task = DockerTask(mock_swarm, mock_stack,
                          mock_service, mock_docker_task)

        assert task.is_healthy is False

    def test_is_healthy_no_health_check(self, mock_swarm, mock_stack, mock_service, mock_docker_task,
                                        mock_docker_client):
        """Test is_healthy when running but no health check"""
        mock_swarm.nodes = []
        mock_container = MagicMock()
        mock_container.attrs = {"State": {}}
        mock_docker_client.containers.get.return_value = mock_container

        task = DockerTask(mock_swarm, mock_stack,
                          mock_service, mock_docker_task)

        assert task.is_healthy is True

    def test_is_healthy_unhealthy(self, mock_swarm, mock_stack, mock_service, mock_docker_task,
                                  mock_docker_client):
        """Test is_healthy when unhealthy"""
        mock_swarm.nodes = []
        mock_container = MagicMock()
        mock_container.attrs = {
            "State": {
                "Health": {
                    "Status": "unhealthy"
                }
            }
        }
        mock_docker_client.containers.get.return_value = mock_container

        task = DockerTask(mock_swarm, mock_stack,
                          mock_service, mock_docker_task)

        assert task.is_healthy is False

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

    def test_container_id_no_container_id(self, mock_swarm, mock_stack, mock_service, mock_docker_task,
                                          mock_docker_client):
        """Test container_id property when container has no ID"""
        mock_swarm.nodes = []
        mock_container = MagicMock()
        mock_container.id = None
        mock_docker_client.containers.get.return_value = mock_container

        task = DockerTask(mock_swarm, mock_stack,
                          mock_service, mock_docker_task)

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
