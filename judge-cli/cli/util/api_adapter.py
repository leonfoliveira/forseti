import click
import keyring
import keyring.errors
import re
import requests
import warnings
from typing import Union
from urllib3.exceptions import InsecureRequestWarning

from .input_adapter import InputAdapter


warnings.simplefilter("ignore", InsecureRequestWarning)


DEFAULT_API_URL = "https://api.judge.app"
VERIFY_SSL = False


class ApiAdapter:
    SERVICE_NAME = "judge-cli"
    SESSION_ID_KEYRING_KEY = "session_id"
    SESSION_ID_COOKIE = "session_id"

    def __init__(self, api_url: str = None):
        self.api_url = api_url or DEFAULT_API_URL
        self.input_adapter = InputAdapter()

    def get(self, path: str, **kwargs) -> Union[dict, list]:
        session_id = self._authenticate()
        response = requests.get(
            f"{self.api_url}{path}",
            **kwargs,
            verify=VERIFY_SSL,
            cookies={self.SESSION_ID_COOKIE: session_id},
        )
        if response.status_code != 200:
            raise click.ClickException(response.text)
        return response.json()

    def post(self, path: str, json=None, **kwargs) -> Union[dict, list]:
        session_id = self._authenticate()
        response = requests.post(
            f"{self.api_url}{path}",
            json=json,
            **kwargs,
            verify=VERIFY_SSL,
            cookies={self.SESSION_ID_COOKIE: session_id},
        )
        if response.status_code != 200:
            raise click.ClickException(response.text)
        return response.json()

    def put(self, path: str, json=None, **kwargs) -> Union[dict, list]:
        session_id = self._authenticate()
        response = requests.put(
            f"{self.api_url}{path}",
            json=json,
            **kwargs,
            verify=VERIFY_SSL,
            cookies={self.SESSION_ID_COOKIE: session_id},
        )
        if response.status_code != 200:
            raise click.ClickException(response.text)
        return response.json()

    def delete(self, path: str, **kwargs) -> None:
        session_id = self._authenticate()
        response = requests.delete(
            f"{self.api_url}{path}",
            **kwargs,
            verify=VERIFY_SSL,
            cookies={self.SESSION_ID_COOKIE: session_id},
        )
        if response.status_code != 204:
            raise click.ClickException(response.text)

    def _authenticate(self):
        if session_id := self._get_cached_session_id():
            response = requests.get(f"{self.api_url}/v1/session/me",
                                    verify=VERIFY_SSL,
                                    cookies={self.SESSION_ID_COOKIE: session_id})
            if response.status_code == 200:
                return session_id

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

        self._set_cached_session_id(session_id)

        return session_id

    def _get_cached_session_id(self) -> str:
        try:
            return keyring.get_password(self.SERVICE_NAME, self.SESSION_ID_KEYRING_KEY)
        except keyring.errors.NoKeyringError:
            click.echo(
                "Warning: No keyring backend available, session ID will not be cached.")
            return None

    def _set_cached_session_id(self, session_id: str) -> None:
        try:
            keyring.set_password(
                self.SERVICE_NAME, self.SESSION_ID_KEYRING_KEY, session_id
            )
        except keyring.errors.NoKeyringError:
            pass
