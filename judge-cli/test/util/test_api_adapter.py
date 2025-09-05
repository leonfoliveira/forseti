import pytest
from unittest.mock import patch
import jwt
import time

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

    def test_authenticate_with_stored_token_not_expired(self, sut, keyring):
        access_token = self._setup_valid_token(keyring)

        assert sut._authenticate() == access_token

    def test_authenticate_with_stored_token_expired(self, sut, keyring, requests, input_adapter):
        access_token = jwt.encode(
            {"exp": time.time() - 3600}, "secret", algorithm="HS256")
        keyring.get_password.return_value = access_token

        input_adapter.password.return_value = "password"
        response = requests.Response()
        response.status_code = 200
        response.cookies = {"access_token": "new_token"}
        requests.post.return_value = response

        assert sut._authenticate() == "new_token"

    def test_authenticate_without_stored_token(self, sut, keyring, requests, input_adapter):
        keyring.get_password.return_value = None

        input_adapter.password.return_value = "password"
        response = requests.Response()
        response.status_code = 200
        response.cookies = {"access_token": "new_token"}
        requests.post.return_value = response

        assert sut._authenticate() == "new_token"

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
        access_token = self._setup_valid_token(keyring)
        response = requests.Response()
        response.status_code = 200
        response.json.return_value = {"key": "value"}
        requests.get.return_value = response

        result = sut.get("/test-path")

        requests.get.assert_called_with(
            f"{sut.api_url}/test-path",
            cookies={sut.ACCESS_TOKEN_COOKIE: access_token},
        )
        assert result == {"key": "value"}

    def test_get_failed(self, sut, keyring, requests):
        access_token = self._setup_valid_token(keyring)
        response = requests.Response()
        response.status_code = 404
        response.text = "Not Found"
        requests.get.return_value = response

        with pytest.raises(Exception) as ex:
            sut.get("/test-path")
        assert "Not Found" in str(ex.value)

        requests.get.assert_called_with(
            f"{sut.api_url}/test-path",
            cookies={sut.ACCESS_TOKEN_COOKIE: access_token},
        )

    def test_post_successful(self, sut, keyring, requests):
        access_token = self._setup_valid_token(keyring)
        response = requests.Response()
        response.status_code = 200
        response.json.return_value = {"key": "value"}
        requests.post.return_value = response

        result = sut.post("/test-path", json={"data": "value"})

        requests.post.assert_called_with(
            f"{sut.api_url}/test-path",
            json={"data": "value"},
            cookies={sut.ACCESS_TOKEN_COOKIE: access_token},
        )
        assert result == {"key": "value"}

    def test_post_failed(self, sut, keyring, requests):
        access_token = self._setup_valid_token(keyring)
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
            cookies={sut.ACCESS_TOKEN_COOKIE: access_token},
        )

    def test_put_successful(self, sut, keyring, requests):
        access_token = self._setup_valid_token(keyring)
        response = requests.Response()
        response.status_code = 200
        response.json.return_value = {"key": "value"}
        requests.put.return_value = response

        result = sut.put("/test-path", json={"data": "value"})

        requests.put.assert_called_with(
            f"{sut.api_url}/test-path",
            json={"data": "value"},
            cookies={sut.ACCESS_TOKEN_COOKIE: access_token},
        )
        assert result == {"key": "value"}

    def test_put_failed(self, sut, keyring, requests):
        access_token = self._setup_valid_token(keyring)
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
            cookies={sut.ACCESS_TOKEN_COOKIE: access_token},
        )

    def test_delete_successful(self, sut, keyring, requests):
        access_token = self._setup_valid_token(keyring)
        response = requests.Response()
        response.status_code = 200
        requests.delete.return_value = response

        sut.delete("/test-path")

        requests.delete.assert_called_with(
            f"{sut.api_url}/test-path",
            cookies={sut.ACCESS_TOKEN_COOKIE: access_token},
        )

    def test_delete_failed(self, sut, keyring, requests):
        access_token = self._setup_valid_token(keyring)
        response = requests.Response()
        response.status_code = 500
        response.text = "Server Error"
        requests.delete.return_value = response

        with pytest.raises(Exception) as ex:
            sut.delete("/test-path")
        assert "Server Error" in str(ex.value)

        requests.delete.assert_called_with(
            f"{sut.api_url}/test-path",
            cookies={sut.ACCESS_TOKEN_COOKIE: access_token},
        )

    def _setup_valid_token(self, keyring):
        access_token = jwt.encode(
            {"exp": time.time() + 3600}, "secret", algorithm="HS256")
        keyring.get_password.return_value = access_token
        return access_token
