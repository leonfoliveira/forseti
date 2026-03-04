from unittest.mock import patch, MagicMock
import pytest
from typer.testing import CliRunner

from cli.cmd import app

PACKAGE = "cli.cmd.backup"


class TestBackup:
    @pytest.fixture
    def runner(self):
        return CliRunner()

    @pytest.fixture(autouse=True)
    def mock_docker_client(self):
        with patch(f"{PACKAGE}.get_docker_client") as mock_get_docker_client:
            mock_docker_client = MagicMock()
            mock_get_docker_client.return_value = mock_docker_client
            mock_containers = MagicMock()
            mock_containers.run = MagicMock()
            mock_docker_client.containers = mock_containers
            yield mock_docker_client

    @pytest.fixture(autouse=True)
    def mock_progress(self):
        with patch(f"{PACKAGE}.Progress") as mock_progress:
            mock_progress_instance = MagicMock()
            mock_progress.return_value.__enter__.return_value = mock_progress_instance
            mock_progress_instance.add_task.return_value = "task_id"
            yield mock_progress_instance

    @pytest.fixture(autouse=True)
    def mock_backups_dir(self):
        with patch(f"{PACKAGE}.__backups_dir__", "/test/backups"):
            yield

    def test_backup_success(self, runner, mock_docker_client, mock_progress):
        """Test successful backup creation"""
        result = runner.invoke(app, ["backup"])

        assert result.exit_code == 0
        assert "Backups created successfully" in result.output

        # Verify that docker containers.run was called for each volume
        expected_volumes = [
            "forseti_grafana_data",
            "forseti_minio_data",
            "forseti_postgres_data",
            "forseti_prometheus_data",
            "forseti_rabbitmq_data",
        ]

        assert mock_docker_client.containers.run.call_count == len(
            expected_volumes)

        # Verify progress tracking
        mock_progress.add_task.assert_called_once()
        assert mock_progress.advance.call_count == len(expected_volumes)

    def test_backup_docker_exception(self, runner, mock_docker_client):
        """Test backup when docker operation fails"""
        mock_docker_client.containers.run.side_effect = Exception(
            "Docker error")

        result = runner.invoke(app, ["backup"])

        assert result.exit_code != 0

    def test_backup_docker_run_parameters(self, runner, mock_docker_client):
        """Test that docker run is called with correct parameters"""
        result = runner.invoke(app, ["backup"])

        # Get the first call arguments
        call_args = mock_docker_client.containers.run.call_args_list[0]
        args, kwargs = call_args

        assert kwargs["image"] == "alpine"
        assert kwargs["remove"] is True
        assert "volumes" in kwargs
        assert "/data" in str(kwargs["volumes"])
        assert "/backups" in str(kwargs["volumes"])

    def test_backup_all_volumes_processed(self, runner, mock_docker_client):
        """Test that all expected volumes are processed"""
        result = runner.invoke(app, ["backup"])

        expected_volumes = [
            "forseti_grafana_data",
            "forseti_minio_data",
            "forseti_postgres_data",
            "forseti_prometheus_data",
            "forseti_rabbitmq_data",
        ]

        # Verify each volume is processed
        call_args_list = mock_docker_client.containers.run.call_args_list
        volumes_in_calls = []

        for call_args in call_args_list:
            args, kwargs = call_args
            volumes = kwargs.get("volumes", {})
            for volume_name in volumes:
                if volume_name.startswith("forseti_"):
                    volumes_in_calls.append(volume_name)

        for expected_volume in expected_volumes:
            assert expected_volume in volumes_in_calls

    def test_backup_tar_command_format(self, runner, mock_docker_client):
        """Test that tar command is properly formatted"""
        result = runner.invoke(app, ["backup"])

        # Get the first call to see command format
        call_args = mock_docker_client.containers.run.call_args_list[0]
        args, kwargs = call_args
        command = kwargs["command"]

        assert "tar -czvf" in command
        assert "/backups/" in command
        assert ".tar.gz" in command
        assert "-C /data ." in command
