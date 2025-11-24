import re
import warnings
from typing import Union

import click
import keyring
import keyring.errors
import requests
from urllib3.exceptions import InsecureRequestWarning

from .input_adapter import InputAdapter

warnings.simplefilter("ignore", InsecureRequestWarning)


DEFAULT_API_URL = "https://api.forseti.live"
VERIFY_SSL = False


class ApiAdapter:
    SERVICE_NAME = "forseti-cli"

    SESSION_ID_KEYRING_KEY = "session_id"
    SESSION_ID_COOKIE = "session_id"

    CSRF_TOKEN_KEYRING_KEY = "csrf_token"
    CSRF_TOKEN_COOKIE = "csrf_token"
    CSRF_TOKEN_HEADER = "x-csrf-token"

    def __init__(self, api_url: str = None):
        self.api_url = api_url or DEFAULT_API_URL
        self.input_adapter = InputAdapter()

    def get(self, path: str, **kwargs) -> Union[dict, list]:
        session_id, csrf_token = self._authenticate()
        response = requests.get(
            f"{self.api_url}{path}",
            **kwargs,
            verify=VERIFY_SSL,
            cookies={self.SESSION_ID_COOKIE: session_id},
            headers={self.CSRF_TOKEN_HEADER: csrf_token},
        )
        if response.status_code != 200:
            raise click.ClickException(response.text)
        return response.json()

    def post(self, path: str, json=None, **kwargs) -> Union[dict, list]:
        session_id, csrf_token = self._authenticate()
        response = requests.post(
            f"{self.api_url}{path}",
            json=json,
            **kwargs,
            verify=VERIFY_SSL,
            cookies={self.SESSION_ID_COOKIE: session_id},
            headers={self.CSRF_TOKEN_HEADER: csrf_token},
        )
        if response.status_code != 200:
            raise click.ClickException(response.text)
        return response.json()

    def put(self, path: str, json=None, **kwargs) -> Union[dict, list]:
        session_id, csrf_token = self._authenticate()
        response = requests.put(
            f"{self.api_url}{path}",
            json=json,
            **kwargs,
            verify=VERIFY_SSL,
            cookies={self.SESSION_ID_COOKIE: session_id},
            headers={self.CSRF_TOKEN_HEADER: csrf_token},
        )
        if response.status_code != 200:
            raise click.ClickException(response.text)
        return response.json()

    def delete(self, path: str, **kwargs) -> None:
        session_id, csrf_token = self._authenticate()
        response = requests.delete(
            f"{self.api_url}{path}",
            **kwargs,
            verify=VERIFY_SSL,
            cookies={self.SESSION_ID_COOKIE: session_id},
            headers={self.CSRF_TOKEN_HEADER: csrf_token},
        )
        if response.status_code != 204:
            raise click.ClickException(response.text)

    def _authenticate(self):
        if (session_id := self._get_cached_value(self.SESSION_ID_KEYRING_KEY)) and (
            csrf_token := self._get_cached_value(self.CSRF_TOKEN_KEYRING_KEY)
        ):
            response = requests.get(
                f"{self.api_url}/v1/session/me",
                verify=VERIFY_SSL,
                cookies={self.SESSION_ID_COOKIE: session_id},
                headers={self.CSRF_TOKEN_HEADER: csrf_token},
            )
            if response.status_code == 200:
                return session_id, csrf_token

        password = self.input_adapter.password("Root password: ")
        response = requests.post(
            f"{self.api_url}/v1/root/sign-in",
            verify=VERIFY_SSL,
            json={"login": "root", "password": password},
        )
        if response.status_code != 200:
            raise click.ClickException(response.text)
        cookies = response.headers["Set-Cookie"]
        session_id = re.search(r"(?<=session_id=)[^;]+", cookies).group(0)
        csrf_token = re.search(r"(?<=csrf_token=)[^;]+", cookies).group(0)

        self._set_cached_value(self.SESSION_ID_KEYRING_KEY, session_id)
        self._set_cached_value(self.CSRF_TOKEN_KEYRING_KEY, csrf_token)

        return session_id, csrf_token

    def _get_cached_value(self, key: str) -> str:
        try:
            return keyring.get_password(self.SERVICE_NAME, key)
        except keyring.errors.NoKeyringError:
            click.echo(
                f"Warning: No keyring backend available, {key} will not be cached."
            )
            return None

    def _set_cached_value(self, key: str, value: str) -> None:
        try:
            keyring.set_password(self.SERVICE_NAME, key, value)
        except keyring.errors.NoKeyringError:
            pass
