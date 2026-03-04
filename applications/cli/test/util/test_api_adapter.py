from unittest.mock import patch, MagicMock
import pytest
from datetime import datetime, timezone

from cli.util.api_adapter import ApiAdapter

PACKAGE = "cli.util.api_adapter"


class TestApiAdapter:
    @pytest.fixture
    def mock_docker_stack(self):
        mock_stack = MagicMock()
        mock_stack.config = {
            "global": {
                "domain": "example.com",
                "https": True
            }
        }
        return mock_stack

    @pytest.fixture
    def api_adapter(self, mock_docker_stack):
        return ApiAdapter(
            docker_stack=mock_docker_stack,
            root_password="test_password"
        )

    @pytest.fixture(autouse=True)
    def mock_requests(self):
        with patch(f"{PACKAGE}.requests") as mock_requests:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = {"id": "test_contest"}
            mock_requests.post.return_value = mock_response
            mock_requests.get.return_value = mock_response
            mock_requests.delete.return_value = mock_response
            yield mock_requests

    @pytest.fixture(autouse=True)
    def mock_keyring(self):
        with patch(f"{PACKAGE}.keyring") as mock_keyring:
            mock_keyring.get_password.return_value = None
            mock_keyring.set_password.return_value = None

            # Mock the NoKeyringError exception
            class MockNoKeyringError(Exception):
                pass

            mock_keyring.errors.NoKeyringError = MockNoKeyringError
            yield mock_keyring

    def test_init_with_https(self):
        """Test ApiAdapter initialization with HTTPS"""
        mock_stack = MagicMock()
        mock_stack.config = {"global": {"domain": "test.com", "https": True}}

        adapter = ApiAdapter(mock_stack)

        assert adapter.api_url == "https://api.test.com"

    def test_init_with_http(self):
        """Test ApiAdapter initialization with HTTP"""
        mock_stack = MagicMock()
        mock_stack.config = {"global": {"domain": "test.com", "https": False}}

        adapter = ApiAdapter(mock_stack)

        assert adapter.api_url == "http://api.test.com"

    def test_init_default_http(self):
        """Test ApiAdapter initialization defaults to HTTP when https not specified"""
        mock_stack = MagicMock()
        mock_stack.config = {"global": {"domain": "test.com"}}

        adapter = ApiAdapter(mock_stack)

        assert adapter.api_url == "http://api.test.com"

    def test_create_contest_success(self, api_adapter, mock_requests):
        """Test successful contest creation"""
        with patch.object(api_adapter, '_get_session') as mock_get_session:
            mock_get_session.return_value = {
                "id": "session123", "csrfToken": "csrf123"}

            result = api_adapter.create_contest("test-contest")

            assert result == {"id": "test_contest"}
            mock_requests.post.assert_called_once()

    def test_create_contest_failure(self, api_adapter, mock_requests):
        """Test contest creation failure"""
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.json.return_value = {"message": "Contest already exists"}
        mock_requests.post.return_value = mock_response

        with patch.object(api_adapter, '_get_session') as mock_get_session:
            mock_get_session.return_value = {
                "id": "session123", "csrfToken": "csrf123"}

            with pytest.raises(Exception, match="Contest already exists"):
                api_adapter.create_contest("test-contest")

    def test_find_all_contests(self, api_adapter, mock_requests):
        """Test finding all contests"""
        mock_response = MagicMock()
        mock_response.json.return_value = [
            {"id": "contest1"}, {"id": "contest2"}]
        mock_requests.get.return_value = mock_response

        with patch.object(api_adapter, '_get_session') as mock_get_session:
            mock_get_session.return_value = {
                "id": "session123", "csrfToken": "csrf123"}

            result = api_adapter.find_all_contests()

            assert result == [{"id": "contest1"}, {"id": "contest2"}]
            mock_requests.get.assert_called_once()

    def test_delete_contest(self, api_adapter, mock_requests):
        """Test contest deletion"""
        with patch.object(api_adapter, '_get_session') as mock_get_session:
            mock_get_session.return_value = {
                "id": "session123", "csrfToken": "csrf123"}

            api_adapter.delete_contest("contest123")

            mock_requests.delete.assert_called_once()

    def test_authenticate_root_success(self, api_adapter, mock_requests):
        """Test successful root authentication"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "id": "session123",
            "csrfToken": "csrf123",
            "expiresAt": "2100-01-01T00:00:00Z"
        }
        mock_requests.post.return_value = mock_response

        with patch.object(api_adapter, '_cache_session') as mock_cache:
            result = api_adapter._authenticate_root()

            assert result["id"] == "session123"
            mock_cache.assert_called_once()

    def test_authenticate_root_prompt_password(self, mock_requests):
        """Test authentication prompts for password when not provided"""
        mock_stack = MagicMock()
        mock_stack.config = {"global": {"domain": "test.com"}}
        adapter = ApiAdapter(mock_stack, root_password=None)

        with patch(f"{PACKAGE}.typer.prompt") as mock_prompt:
            mock_prompt.return_value = "prompted_password"
            mock_response = MagicMock()
            mock_response.json.return_value = {"id": "session123"}
            mock_requests.post.return_value = mock_response

            with patch.object(adapter, '_cache_session'):
                adapter._authenticate_root()

            mock_prompt.assert_called_once()
            assert adapter.root_password == "prompted_password"

    def test_cache_session_success(self, api_adapter, mock_keyring):
        """Test successful session caching"""
        session = {"id": "session123", "csrfToken": "csrf123"}

        api_adapter._cache_session(session)

        mock_keyring.set_password.assert_called_once()

    def test_cache_session_no_keyring(self, api_adapter, mock_keyring):
        """Test session caching when no keyring available"""
        mock_keyring.set_password.side_effect = mock_keyring.errors.NoKeyringError()

        session = {"id": "session123", "csrfToken": "csrf123"}

        # Should not raise exception, just show warning
        api_adapter._cache_session(session)

    def test_get_cached_session_valid(self, api_adapter, mock_keyring):
        """Test getting valid cached session"""
        # Use Z suffix to indicate UTC timezone
        session_data = '{"id": "session123", "expiresAt": "2100-01-01T00:00:00Z"}'
        mock_keyring.get_password.return_value = session_data

        result = api_adapter._get_cached_session()

        assert result["id"] == "session123"

    def test_get_cached_session_expired(self, api_adapter, mock_keyring):
        """Test getting expired cached session"""
        # Use Z suffix to indicate UTC timezone
        session_data = '{"id": "session123", "expiresAt": "2000-01-01T00:00:00Z"}'
        result = api_adapter._get_cached_session()

        assert result is None

    def test_get_cached_session_no_cache(self, api_adapter, mock_keyring):
        """Test getting cached session when none exists"""
        mock_keyring.get_password.return_value = None

        result = api_adapter._get_cached_session()

        assert result is None

    def test_get_cached_session_no_keyring(self, api_adapter, mock_keyring):
        """Test getting cached session when no keyring available"""
        mock_keyring.get_password.side_effect = mock_keyring.errors.NoKeyringError()

        result = api_adapter._get_cached_session()

        assert result is None
