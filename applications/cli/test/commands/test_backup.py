import pytest
from unittest.mock import patch
from click.testing import CliRunner
import click

from cli.commands.backup import backup

BASE_PATH = "cli.commands.backup"


class TestBackupCommand:
    """Test cases for the backup command functionality."""

    @pytest.fixture(autouse=True)
    def command_adapter(self):
        with patch(f"{BASE_PATH}.CommandAdapter") as mock:
            from cli.util.command_adapter import CommandAdapter
            mock.Error = CommandAdapter.Error
            yield mock.return_value

    @pytest.fixture(autouse=True)
    def os(self):
        with patch(f"{BASE_PATH}.os") as mock:
            yield mock

    @pytest.fixture(autouse=True)
    def spinner(self):
        with patch(f"{BASE_PATH}.Spinner") as mock:
            yield mock.return_value

    @pytest.fixture
    def runner(self):
        return CliRunner()

    def test_backup(self, runner, command_adapter, os, spinner):
        """Test successful backup creation."""
        os.path.exists.return_value = False

        result = runner.invoke(backup)

        # Verify the command succeeded
        assert result.exit_code == 0

        # Verify backups directory creation
        os.makedirs.assert_called_once_with("./backups")

        # Verify command adapter was called for each volume
        assert command_adapter.run.call_count == 5
        for volume in (
            "forseti_grafana_data",
            "forseti_minio_data",
            "forseti_postgres_data",
            "forseti_prometheus_data",
            "forseti_rabbitmq_data",
        ):
            command_adapter.run.assert_any_call(self._create_command(volume))

        # Verify spinner methods were called appropriately
        spinner.start.assert_called_once()
        spinner.complete.assert_called_once()
        spinner.fail.assert_not_called()

    def test_backup_existing_directory(self, runner, command_adapter, os, spinner):
        """Test backup creation when backups directory already exists."""
        os.path.exists.return_value = True

        result = runner.invoke(backup)

        # Verify the command succeeded
        assert result.exit_code == 0

        # Verify backups directory creation was not called
        os.makedirs.assert_not_called()

        # Verify command adapter was called for each volume
        assert command_adapter.run.call_count == 5

        # Verify spinner methods were called appropriately
        spinner.start.assert_called_once()
        spinner.complete.assert_called_once()
        spinner.fail.assert_not_called()

    def test_backup_failure(self, runner, command_adapter, os, spinner):
        """Test backup creation failure handling."""
        os.path.exists.return_value = True
        command_adapter.run.side_effect = Exception("Docker error")

        result = runner.invoke(backup)

        # Verify the command failed
        assert result.exit_code != 0

        # Verify backups directory creation was not called
        os.makedirs.assert_not_called()

    def _create_command(self, volume: str):
        return [
            "docker", "run", "--rm", "-v", f"{volume}:/data", "-v", "./backups:/backups", "alpine",
            "tar", "-czvf", f"/backups/{volume}.tar.gz", "-C", "/data", "."
        ]
