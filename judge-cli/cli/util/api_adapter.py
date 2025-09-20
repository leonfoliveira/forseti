import time
from typing import Union

import click
import keyring
import keyring.errors
import requests

from .input_adapter import InputAdapter


DEFAULT_API_URL = "https://api.judge"


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
            cookies={self.SESSION_ID_COOKIE: session_id},
        )
        if response.status_code != 204:
            raise click.ClickException(response.text)

    def _authenticate(self):
        if session_id := self._get_cached_session_id():
            response = requests.get(f"{self.api_url}/v1/session/me",
                                    cookies={self.SESSION_ID_COOKIE: session_id})
            if response.status_code == 200:
                return session_id

        password = self.input_adapter.password("Root password: ")
        response = requests.post(
            f"{self.api_url}/v1/auth/sign-in",
            json={"login": "root", "password": password},
        )
        if response.status_code != 200:
            raise click.ClickException(response.text)
        session_id = response.cookies.get(self.SESSION_ID_COOKIE)

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
