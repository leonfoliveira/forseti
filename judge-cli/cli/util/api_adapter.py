import time
from typing import Union

import click
import jwt
import keyring
import keyring.errors
import requests

from .input_adapter import InputAdapter
from .network_adapter import NetworkAdapter


class ApiAdapter:
    SERVICE_NAME = "judge-cli"
    TOKEN_KEYRING_KEY = "access_token"
    ACCESS_TOKEN_COOKIE_NAME = "access_token"

    def __init__(self, api_url: str = None):
        network_adapter = NetworkAdapter()
        self.api_url = api_url or f"http://{network_adapter.get_ip_address()}:8080"
        self.input_adapter = InputAdapter()

    def get(self, path: str, **kwargs) -> Union[dict, list]:
        access_token = self._authenticate()
        response = requests.get(
            f"{self.api_url}{path}",
            **kwargs,
            cookies={self.ACCESS_TOKEN_COOKIE_NAME: access_token},
        )
        if response.status_code != 200:
            raise click.ClickException(response.text)
        return response.json()

    def post(self, path: str, json=None, **kwargs) -> Union[dict, list]:
        access_token = self._authenticate()
        response = requests.post(
            f"{self.api_url}{path}",
            json=json,
            **kwargs,
            cookies={self.ACCESS_TOKEN_COOKIE_NAME: access_token},
        )
        if response.status_code != 200:
            raise click.ClickException(response.text)
        return response.json()

    def put(self, path: str, json=None, **kwargs) -> Union[dict, list]:
        access_token = self._authenticate()
        response = requests.put(
            f"{self.api_url}{path}",
            json=json,
            **kwargs,
            cookies={self.ACCESS_TOKEN_COOKIE_NAME: access_token},
        )
        if response.status_code != 200:
            raise click.ClickException(response.text)
        return response.json()

    def delete(self, path: str, **kwargs) -> None:
        access_token = self._authenticate()
        response = requests.delete(
            f"{self.api_url}{path}",
            **kwargs,
            cookies={self.ACCESS_TOKEN_COOKIE_NAME: access_token},
        )
        if response.status_code != 204:
            raise click.ClickException(response.text)

    def _authenticate(self):
        if token := self._get_cached_token():
            claims = jwt.decode(token, options={"verify_signature": False})
            expiration = claims.get("exp")
            if expiration and expiration > int(time.time()):
                return token

        password = self.input_adapter.password("Root password: ")
        response = requests.post(
            f"{self.api_url}/v1/auth/sign-in",
            json={"login": "root", "password": password},
        )
        if response.status_code != 200:
            raise click.ClickException(response.text)
        access_token = response.cookies.get(self.ACCESS_TOKEN_COOKIE_NAME)

        self._set_cached_token(access_token)

        return access_token

    def _get_cached_token(self) -> str:
        try:
            return keyring.get_password(self.SERVICE_NAME, self.TOKEN_KEYRING_KEY)
        except keyring.errors.NoKeyringError:
            return None

    def _set_cached_token(self, access_token: str) -> None:
        try:
            keyring.set_password(
                self.SERVICE_NAME, self.TOKEN_KEYRING_KEY, access_token
            )
        except keyring.errors.NoKeyringError:
            pass
