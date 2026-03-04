from unittest.mock import patch, MagicMock
import pytest
from docker.errors import APIError, NotFound

from cli.util.docker.docker_service import DockerService

PACKAGE = "cli.util.docker.docker_service"


class TestDockerService:
    @pytest.fixture
    def mock_swarm(self):
        swarm = MagicMock()
        # Mock nodes for global service testing
        swarm.nodes = [MagicMock(), MagicMock(), MagicMock()]  # 3 nodes
        return swarm

    @pytest.fixture
    def mock_stack(self):
        return MagicMock()

    @pytest.fixture
    def mock_config(self):
        return {
            "image": "nginx:latest",
            "deploy": {
                "replicas": 3
            }
        }

    @pytest.fixture
    def mock_docker_service_replicated(self):
        service = MagicMock()
        service.attrs = {
            "Spec": {
                "Mode": {
                    "Replicated": {
                        "Replicas": 3
                    }
                }
            },
            "Version": {
                "Index": 123
            }
        }
        # Mock tasks method
        service.tasks.return_value = [
            {"Status": {"State": "running"}},
            {"Status": {"State": "running"}},
            {"Status": {"State": "running"}}
        ]
        return service

    @pytest.fixture
    def mock_docker_service_global(self):
        service = MagicMock()
        service.attrs = {
            "Spec": {
                "Mode": {
                    "Global": {}
                }
            }
        }
        service.tasks.return_value = [
            {"Status": {"State": "running"}},
            {"Status": {"State": "running"}},
            {"Status": {"State": "running"}}
        ]
        return service

    def test_init(self, mock_swarm, mock_stack, mock_config):
        """Test DockerService initialization"""
        service = DockerService(mock_swarm, mock_stack,
                                "test_service", mock_config, None)

        assert service.swarm == mock_swarm
        assert service.stack == mock_stack
        assert service.name == "test_service"
        assert service.config == mock_config
        assert service.docker_service is None

    def test_is_running_true(self, mock_swarm, mock_stack, mock_config, mock_docker_service_replicated):
        """Test is_running when service has running replicas"""
        service = DockerService(
            mock_swarm, mock_stack, "test", mock_config, mock_docker_service_replicated)

        assert service.is_running is True

    def test_is_running_false_no_docker_service(self, mock_swarm, mock_stack, mock_config):
        """Test is_running when no docker service"""
        service = DockerService(mock_swarm, mock_stack,
                                "test", mock_config, None)

        assert service.is_running is False

    def test_mode_replicated(self, mock_swarm, mock_stack, mock_config, mock_docker_service_replicated):
        """Test mode property for replicated service"""
        service = DockerService(
            mock_swarm, mock_stack, "test", mock_config, mock_docker_service_replicated)

        assert service.mode == "replicated"

    def test_mode_global(self, mock_swarm, mock_stack, mock_config, mock_docker_service_global):
        """Test mode property for global service"""
        service = DockerService(mock_swarm, mock_stack,
                                "test", mock_config, mock_docker_service_global)

        assert service.mode == "global"

    def test_mode_unknown_no_service(self, mock_swarm, mock_stack, mock_config):
        """Test mode property when no docker service"""
        service = DockerService(mock_swarm, mock_stack,
                                "test", mock_config, None)

        assert service.mode == "unknown"

    def test_mode_unknown_invalid_mode(self, mock_swarm, mock_stack, mock_config):
        """Test mode property with invalid mode"""
        docker_service = MagicMock()
        docker_service.attrs = {"Spec": {"Mode": {}}}

        service = DockerService(mock_swarm, mock_stack,
                                "test", mock_config, docker_service)

        assert service.mode == "unknown"

    def test_desired_replicas_replicated(self, mock_swarm, mock_stack, mock_config, mock_docker_service_replicated):
        """Test desired_replicas for replicated service"""
        service = DockerService(
            mock_swarm, mock_stack, "test", mock_config, mock_docker_service_replicated)

        assert service.desired_replicas == 3

    def test_desired_replicas_global(self, mock_swarm, mock_stack, mock_config, mock_docker_service_global):
        """Test desired_replicas for global service"""
        service = DockerService(mock_swarm, mock_stack,
                                "test", mock_config, mock_docker_service_global)

        assert service.desired_replicas == 3  # Number of nodes

    def test_desired_replicas_no_service(self, mock_swarm, mock_stack, mock_config):
        """Test desired_replicas when no docker service"""
        service = DockerService(mock_swarm, mock_stack,
                                "test", mock_config, None)

        assert service.desired_replicas == 0

    def test_running_replicas_success(self, mock_swarm, mock_stack, mock_config, mock_docker_service_replicated):
        """Test running_replicas with running tasks"""
        service = DockerService(
            mock_swarm, mock_stack, "test", mock_config, mock_docker_service_replicated)

        assert service.running_replicas == 3

    def test_running_replicas_no_service(self, mock_swarm, mock_stack, mock_config):
        """Test running_replicas when no docker service"""
        service = DockerService(mock_swarm, mock_stack,
                                "test", mock_config, None)

        assert service.running_replicas == 0

    def test_running_replicas_not_found(self, mock_swarm, mock_stack, mock_config, mock_docker_service_replicated):
        """Test running_replicas when service not found"""
        mock_docker_service_replicated.tasks.side_effect = NotFound(
            "Service not found")

        service = DockerService(
            mock_swarm, mock_stack, "test", mock_config, mock_docker_service_replicated)

        assert service.running_replicas == 0

    def test_running_replicas_api_error(self, mock_swarm, mock_stack, mock_config, mock_docker_service_replicated):
        """Test running_replicas with API error"""
        mock_docker_service_replicated.tasks.side_effect = APIError(
            "API error")

        service = DockerService(
            mock_swarm, mock_stack, "test", mock_config, mock_docker_service_replicated)

        assert service.running_replicas == 0

    def test_running_replicas_mixed_states(self, mock_swarm, mock_stack, mock_config, mock_docker_service_replicated):
        """Test running_replicas with mixed task states"""
        mock_docker_service_replicated.tasks.return_value = [
            {"Status": {"State": "running"}},
            {"Status": {"State": "failed"}},
            {"Status": {"State": "running"}},
            {"Status": {"State": "pending"}}
        ]

        service = DockerService(
            mock_swarm, mock_stack, "test", mock_config, mock_docker_service_replicated)

        assert service.running_replicas == 2

    @patch(f"{PACKAGE}.DockerTask")
    def test_tasks_property(self, mock_docker_task, mock_swarm, mock_stack, mock_config, mock_docker_service_replicated):
        """Test tasks property"""
        mock_docker_task.return_value = "mock_task"

        service = DockerService(
            mock_swarm, mock_stack, "test", mock_config, mock_docker_service_replicated)

        tasks = service.tasks
        assert len(tasks) == 3
        assert all(task == "mock_task" for task in tasks)

    @patch(f"{PACKAGE}.DockerTask")
    def test_tasks_filtered_states(self, mock_docker_task, mock_swarm, mock_stack, mock_config, mock_docker_service_replicated):
        """Test tasks property filters only active states"""
        mock_docker_task.return_value = "mock_task"

        # Mix of active and inactive states
        mock_docker_service_replicated.tasks.return_value = [
            {"Status": {"State": "running"}},     # active
            # inactive - should be filtered
            {"Status": {"State": "failed"}},
            {"Status": {"State": "pending"}},     # active
            # inactive - should be filtered
            {"Status": {"State": "complete"}},
            {"Status": {"State": "assigned"}}     # active
        ]

        service = DockerService(
            mock_swarm, mock_stack, "test", mock_config, mock_docker_service_replicated)

        tasks = service.tasks
        assert len(tasks) == 3  # Only active states
        assert mock_docker_task.call_count == 3

    def test_tasks_no_service(self, mock_swarm, mock_stack, mock_config):
        """Test tasks property when no docker service"""
        service = DockerService(mock_swarm, mock_stack,
                                "test", mock_config, None)

        assert service.tasks == []

    def test_tasks_api_error(self, mock_swarm, mock_stack, mock_config, mock_docker_service_replicated):
        """Test tasks property with API error"""
        mock_docker_service_replicated.tasks.side_effect = APIError(
            "API error")

        service = DockerService(
            mock_swarm, mock_stack, "test", mock_config, mock_docker_service_replicated)

        assert service.tasks == []

    @patch(f"{PACKAGE}.DockerTask")
    def test_is_converged_true(self, mock_docker_task, mock_swarm, mock_stack, mock_config, mock_docker_service_replicated):
        """Test is_converged when service is converged"""
        # Mock healthy running tasks
        mock_task = MagicMock()
        mock_task.is_running = True
        mock_task.is_healthy = True
        mock_docker_task.return_value = mock_task

        service = DockerService(
            mock_swarm, mock_stack, "test", mock_config, mock_docker_service_replicated)

        assert service.is_converged is True

    @patch(f"{PACKAGE}.DockerTask")
    def test_is_converged_wrong_replica_count(self, mock_docker_task, mock_swarm, mock_stack, mock_config, mock_docker_service_replicated):
        """Test is_converged with wrong number of running replicas"""
        # Mock only 2 running tasks instead of 3 desired
        mock_task_running = MagicMock()
        mock_task_running.is_running = True
        mock_task_running.is_healthy = True

        mock_task_not_running = MagicMock()
        mock_task_not_running.is_running = False

        mock_docker_task.side_effect = [
            mock_task_running, mock_task_running, mock_task_not_running]

        service = DockerService(
            mock_swarm, mock_stack, "test", mock_config, mock_docker_service_replicated)

        assert service.is_converged is False

    @patch(f"{PACKAGE}.DockerTask")
    def test_is_converged_unhealthy_task(self, mock_docker_task, mock_swarm, mock_stack, mock_config, mock_docker_service_replicated):
        """Test is_converged with unhealthy task"""
        # Mock tasks with one unhealthy
        mock_task_healthy = MagicMock()
        mock_task_healthy.is_running = True
        mock_task_healthy.is_healthy = True

        mock_task_unhealthy = MagicMock()
        mock_task_unhealthy.is_running = True
        mock_task_unhealthy.is_healthy = False

        mock_docker_task.side_effect = [
            mock_task_healthy, mock_task_healthy, mock_task_unhealthy]

        service = DockerService(
            mock_swarm, mock_stack, "test", mock_config, mock_docker_service_replicated)

        assert service.is_converged is False

    def test_scale_success(self, mock_swarm, mock_stack, mock_config, mock_docker_service_replicated):
        """Test successful scaling"""
        service = DockerService(
            mock_swarm, mock_stack, "test", mock_config, mock_docker_service_replicated)

        service.scale(5)

        mock_docker_service_replicated.scale.assert_called_once_with(5)
        mock_docker_service_replicated.reload.assert_called_once()

    def test_scale_no_service(self, mock_swarm, mock_stack, mock_config):
        """Test scaling when no docker service"""
        service = DockerService(mock_swarm, mock_stack,
                                "test", mock_config, None)

        with pytest.raises(ValueError, match="Service 'test' is not deployed"):
            service.scale(5)

    def test_force_update_success(self, mock_swarm, mock_stack, mock_config, mock_docker_service_replicated):
        """Test successful force update"""
        # Add TaskTemplate with ForceUpdate to attrs
        mock_docker_service_replicated.attrs["Spec"]["TaskTemplate"] = {
            "ForceUpdate": 5}

        service = DockerService(
            mock_swarm, mock_stack, "test", mock_config, mock_docker_service_replicated)

        service.force_update()

        mock_docker_service_replicated.update.assert_called_once_with(
            version=123, force_update=6)
        mock_docker_service_replicated.reload.assert_called_once()

    def test_force_update_no_force_update_field(self, mock_swarm, mock_stack, mock_config, mock_docker_service_replicated):
        """Test force update when ForceUpdate field is missing"""
        # Remove ForceUpdate from attrs
        mock_docker_service_replicated.attrs["Spec"]["TaskTemplate"] = {}

        service = DockerService(
            mock_swarm, mock_stack, "test", mock_config, mock_docker_service_replicated)

        service.force_update()

        mock_docker_service_replicated.update.assert_called_once_with(
            version=123, force_update=1)

    def test_force_update_no_service(self, mock_swarm, mock_stack, mock_config):
        """Test force update when no docker service"""
        service = DockerService(mock_swarm, mock_stack,
                                "test", mock_config, None)

        with pytest.raises(ValueError, match="Service 'test' is not deployed"):
            service.force_update()

    def test_different_replica_counts(self, mock_swarm, mock_stack, mock_config):
        """Test different replica counts for replicated services"""
        test_counts = [0, 1, 2, 5, 10]

        for count in test_counts:
            docker_service = MagicMock()
            docker_service.attrs = {
                "Spec": {
                    "Mode": {
                        "Replicated": {
                            "Replicas": count
                        }
                    }
                }
            }

            service = DockerService(
                mock_swarm, mock_stack, "test", mock_config, docker_service)
            assert service.desired_replicas == count

    def test_active_task_states(self, mock_swarm, mock_stack, mock_config):
        """Test that all expected active states are included in tasks"""
        active_states = ["new", "pending", "assigned",
                         "accepted", "preparing", "starting", "running"]

        docker_service = MagicMock()
        docker_service.tasks.return_value = [
            {"Status": {"State": state}} for state in active_states
        ]

        with patch(f"{PACKAGE}.DockerTask") as mock_docker_task:
            mock_docker_task.return_value = "mock_task"

            service = DockerService(
                mock_swarm, mock_stack, "test", mock_config, docker_service)

            tasks = service.tasks
            assert len(tasks) == len(active_states)
            assert mock_docker_task.call_count == len(active_states)
