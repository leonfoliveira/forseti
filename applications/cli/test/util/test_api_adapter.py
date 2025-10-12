import pytest
from unittest.mock import MagicMock, patch

from cli.util.api_adapter import ApiAdapter


BASE_PATH = "cli.util.api_adapter"


class TestApiAdapter:
    @pytest.fixture(autouse=True)
    def keyring(self):
        with patch(f"{BASE_PATH}.keyring") as mock:
            yield mock

    @pytest.fixture(autouse=True)
    def requests(self):
        with patch(f"{BASE_PATH}.requests") as mock:
            yield mock

    @pytest.fixture(autouse=True)
    def input_adapter(self):
        with patch(f"{BASE_PATH}.InputAdapter") as mock:
            yield mock.return_value

    @pytest.fixture
    def sut(self):
        yield ApiAdapter()

    def test_authenticate_with_stored_session_not_expired(self, sut, keyring, requests):
        session_id = self._setup_valid_session(keyring, requests)

        assert sut._authenticate() == session_id

    def test_authenticate_without_stored_session(self, sut, keyring, requests, input_adapter):
        keyring.get_password.return_value = None

        input_adapter.password.return_value = "password"
        response = requests.Response()
        response.status_code = 200
        response.headers = {"Set-Cookie": "session_id=123"}
        requests.post.return_value = response

        assert sut._authenticate() == "123"

    def test_authenticate_with_failed_request(self, sut, keyring, requests, input_adapter):
        keyring.get_password.return_value = None

        input_adapter.password.return_value = "password"
        response = requests.Response()
        response.status_code = 401
        response.text = "Unauthorized"
        requests.post.return_value = response

        with pytest.raises(Exception) as ex:
            sut._authenticate()
        assert "Unauthorized" in str(ex.value)

    def test_get_successful(self, sut, keyring, requests):
        session_id = self._setup_valid_session(keyring, requests)
        response = requests.Response()
        response.status_code = 200
        response.json.return_value = {"key": "value"}
        requests.get.side_effect = [
            MagicMock(status_code=200),
            response
        ]

        result = sut.get("/test-path")

        requests.get.assert_called_with(
            f"{sut.api_url}/test-path",
            verify=False,
            cookies={sut.SESSION_ID_COOKIE: session_id},
        )
        assert result == {"key": "value"}

    def test_get_failed(self, sut, keyring, requests):
        session_id = self._setup_valid_session(keyring, requests)
        response = requests.Response()
        response.status_code = 404
        response.text = "Not Found"
        requests.get.side_effect = [
            MagicMock(status_code=200),
            response
        ]

        with pytest.raises(Exception) as ex:
            sut.get("/test-path")
        assert "Not Found" in str(ex.value)

        requests.get.assert_called_with(
            f"{sut.api_url}/test-path",
            verify=False,
            cookies={sut.SESSION_ID_COOKIE: session_id},
        )

    def test_post_successful(self, sut, keyring, requests):
        session_id = self._setup_valid_session(keyring, requests)
        response = requests.Response()
        response.status_code = 200
        response.json.return_value = {"key": "value"}
        requests.post.return_value = response

        result = sut.post("/test-path", json={"data": "value"})

        requests.post.assert_called_with(
            f"{sut.api_url}/test-path",
            json={"data": "value"},
            verify=False,
            cookies={sut.SESSION_ID_COOKIE: session_id},
        )
        assert result == {"key": "value"}

    def test_post_failed(self, sut, keyring, requests):
        session_id = self._setup_valid_session(keyring, requests)
        response = requests.Response()
        response.status_code = 400
        response.text = "Bad Request"
        requests.post.return_value = response

        with pytest.raises(Exception) as ex:
            sut.post("/test-path", json={"data": "value"})
        assert "Bad Request" in str(ex.value)

        requests.post.assert_called_with(
            f"{sut.api_url}/test-path",
            json={"data": "value"},
            verify=False,
            cookies={sut.SESSION_ID_COOKIE: session_id},
        )

    def test_put_successful(self, sut, keyring, requests):
        session_id = self._setup_valid_session(keyring, requests)
        response = requests.Response()
        response.status_code = 200
        response.json.return_value = {"key": "value"}
        requests.put.return_value = response

        result = sut.put("/test-path", json={"data": "value"})

        requests.put.assert_called_with(
            f"{sut.api_url}/test-path",
            json={"data": "value"},
            verify=False,
            cookies={sut.SESSION_ID_COOKIE: session_id},
        )
        assert result == {"key": "value"}

    def test_put_failed(self, sut, keyring, requests):
        session_id = self._setup_valid_session(keyring, requests)
        response = requests.Response()
        response.status_code = 403
        response.text = "Forbidden"
        requests.put.return_value = response

        with pytest.raises(Exception) as ex:
            sut.put("/test-path", json={"data": "value"})
        assert "Forbidden" in str(ex.value)

        requests.put.assert_called_with(
            f"{sut.api_url}/test-path",
            json={"data": "value"},
            verify=False,
            cookies={sut.SESSION_ID_COOKIE: session_id},
        )

    def test_delete_successful(self, sut, keyring, requests):
        session_id = self._setup_valid_session(keyring, requests)
        response = requests.Response()
        response.status_code = 204
        requests.delete.return_value = response

        sut.delete("/test-path")

        requests.delete.assert_called_with(
            f"{sut.api_url}/test-path",
            verify=False,
            cookies={sut.SESSION_ID_COOKIE: session_id},
        )

    def test_delete_failed(self, sut, keyring, requests):
        session_id = self._setup_valid_session(keyring, requests)
        response = requests.Response()
        response.status_code = 500
        response.text = "Server Error"
        requests.delete.return_value = response

        with pytest.raises(Exception) as ex:
            sut.delete("/test-path")
        assert "Server Error" in str(ex.value)

        requests.delete.assert_called_with(
            f"{sut.api_url}/test-path",
            verify=False,
            cookies={sut.SESSION_ID_COOKIE: session_id},
        )

    def test_get_cached_session_id_with_keyring_error(self, sut, keyring):
        keyring.errors.NoKeyringError = Exception
        keyring.get_password.side_effect = keyring.errors.NoKeyringError

        result = sut._get_cached_session_id()

        assert result is None

    def test_set_cached_session_id_with_keyring_error(self, sut, keyring):
        keyring.errors.NoKeyringError = Exception
        keyring.set_password.side_effect = keyring.errors.NoKeyringError

        # Should not raise an exception
        sut._set_cached_session_id("test_session")

        keyring.set_password.assert_called_once_with(
            sut.SERVICE_NAME, sut.SESSION_ID_KEYRING_KEY, "test_session"
        )

    def test_api_adapter_with_custom_url(self):
        custom_url = "https://api.example.com"
        adapter = ApiAdapter(api_url=custom_url)
        assert adapter.api_url == custom_url

    def test_api_adapter_with_default_url(self):
        adapter = ApiAdapter()
        assert adapter.api_url == "https://api.forseti.live"

    def _setup_valid_session(self, keyring, requests):
        session_id = "123"
        keyring.get_password.return_value = session_id
        requests.get.return_value = MagicMock(status_code=200)
        return session_id
