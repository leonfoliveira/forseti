import pytest
from unittest.mock import patch, MagicMock
from click.testing import CliRunner

from cli.commands.contest import contest

BASE_PATH = "cli.commands.contest"


class TestContestCommand:
    @pytest.fixture(autouse=True)
    def api_adapter(self):
        with patch(f"{BASE_PATH}.ApiAdapter") as mock:
            yield mock.return_value

    @pytest.fixture
    def runner(self):
        return CliRunner()

    def test_create_contest_success(self, runner, api_adapter):
        """Test creating a contest with a valid slug."""
        api_adapter.post.return_value = {"id": "12345"}
        result = runner.invoke(contest, ["create", "valid-slug"])
        assert result.exit_code == 0
        assert "12345" in result.output
        api_adapter.post.assert_called_once()

    def test_create_contest_invalid_slug(self, runner):
        """Test creating a contest with an invalid slug."""
        result = runner.invoke(contest, ["create", "invalid slug!"])
        assert result.exit_code != 0
        assert "Slug must be alphanumeric with dashes only." in result.output

    def test_list_contests(self, runner, api_adapter):
        """Test listing contests."""
        api_adapter.get.return_value = [
            {
                "id": "1",
                "slug": "contest-1",
                "title": "Contest 1",
                "startAt": "2023-01-01T00:00:00.000Z",
                "endAt": "2023-01-01T01:00:00.000Z",
            },
            {
                "id": "2",
                "slug": "contest-2",
                "title": "Contest 2",
                "startAt": "2023-02-01T00:00:00.000Z",
                "endAt": "2023-02-01T01:00:00.000Z",
            },
        ]
        result = runner.invoke(contest, ["ls"])
        assert result.exit_code == 0
        assert "contest-1" in result.output
        assert "contest-2" in result.output
        api_adapter.get.assert_called_once()

    def test_delete_contest(self, runner, api_adapter):
        """Test deleting a contest."""
        result = runner.invoke(contest, ["delete", "12345"])
        assert result.exit_code == 0
        api_adapter.delete.assert_called_once_with("/v1/contests/12345")
        assert api_adapter.delete.call_count == 1

    def test_get_contest_status_not_started(self, runner, api_adapter):
        """Test contest status determination for a not started contest."""
        api_adapter.get.return_value = [
            {
                "id": "1",
                "slug": "contest-1",
                "title": "Contest 1",
                "startAt": "2100-01-01T00:00:00.000Z",
                "endAt": "2100-01-01T01:00:00.000Z",
            }
        ]
        result = runner.invoke(contest, ["ls"])
        assert result.exit_code == 0
        assert "NOT_STARTED" in result.output

    def test_get_contest_status_in_progress(self, runner, api_adapter):
        """Test contest status determination for an in progress contest."""
        api_adapter.get.return_value = [
            {
                "id": "1",
                "slug": "contest-1",
                "title": "Contest 1",
                "startAt": "2000-01-01T00:00:00.000Z",
                "endAt": "2100-01-01T01:00:00.000Z",
            }
        ]
        result = runner.invoke(contest, ["ls"])
        assert result.exit_code == 0
        assert "IN_PROGRESS" in result.output

    def test_get_contest_status_ended(self, runner, api_adapter):
        """Test contest status determination for an ended contest."""
        api_adapter.get.return_value = [
            {
                "id": "1",
                "slug": "contest-1",
                "title": "Contest 1",
                "startAt": "2000-01-01T00:00:00.000Z",
                "endAt": "2000-01-01T01:00:00.000Z",
            }
        ]
        result = runner.invoke(contest, ["ls"])
        assert result.exit_code == 0
        assert "ENDED" in result.output

    def test_start_contest(self, runner, api_adapter):
        """Test force starting a contest."""
        result = runner.invoke(contest, ["start", "12345"])
        assert result.exit_code == 0
        api_adapter.put.assert_called_once_with("/v1/contests/12345/start")
        assert api_adapter.put.call_count == 1

    def test_end_contest(self, runner, api_adapter):
        """Test force ending a contest."""
        result = runner.invoke(contest, ["end", "12345"])
        assert result.exit_code == 0
        api_adapter.put.assert_called_once_with("/v1/contests/12345/end")
        assert api_adapter.put.call_count == 1
