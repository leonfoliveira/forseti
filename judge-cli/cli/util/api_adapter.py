import time
from typing import Union

import click
import jwt
import keyring
import requests


class ApiAdapter:
    SERVICE_NAME = "judge-cli"
    TOKEN_KEY = "access_token"
    AUTHORIZATION_KEY = "Authorization"
    ACCESS_TOKEN_COOKIE = "access_token"

    def __init__(self, api_url: str = None):
        self.api_url = api_url or "http://localhost:8080"

    def authenticate(self):
        if token := keyring.get_password(self.SERVICE_NAME, self.TOKEN_KEY):
            claims = jwt.decode(token, options={"verify_signature": False})
            expiration = claims.get("exp")
            if expiration and expiration > int(time.time()):
                return token

        password = click.prompt("Root password: ")
        response = requests.post(
            f"{self.api_url}/v1/auth/sign-in",
            json={"login": "root", "password": password},
        )
        if response.status_code != 200:
            raise click.ClickException(response.text)
        access_token = response.cookies.get(self.ACCESS_TOKEN_COOKIE)
        keyring.set_password(self.SERVICE_NAME, self.TOKEN_KEY, access_token)
        return access_token

    def get(self, path: str, **kwargs) -> Union[dict, list]:
        access_token = self.authenticate()
        response = requests.get(
            f"{self.api_url}{path}",
            **kwargs,
            cookies={self.ACCESS_TOKEN_COOKIE: access_token},
        )
        if response.status_code != 200:
            raise click.ClickException(response.text)
        return response.json()

    def post(self, path: str, json=None, **kwargs) -> Union[dict, list]:
        access_token = self.authenticate()
        response = requests.post(
            f"{self.api_url}{path}",
            json=json,
            **kwargs,
            cookies={self.ACCESS_TOKEN_COOKIE: access_token},
        )
        if response.status_code != 200:
            raise click.ClickException(response.text)
        return response.json()

    def put(self, path: str, json=None, **kwargs) -> Union[dict, list]:
        access_token = self.authenticate()
        response = requests.put(
            f"{self.api_url}{path}",
            json=json,
            **kwargs,
            cookies={self.ACCESS_TOKEN_COOKIE: access_token},
        )
        if response.status_code != 200:
            raise click.ClickException(response.text)
        return response.json()

    def delete(self, path: str, **kwargs) -> None:
        access_token = self.authenticate()
        response = requests.delete(
            f"{self.api_url}{path}",
            **kwargs,
            cookies={self.ACCESS_TOKEN_COOKIE: access_token},
        )
        if response.status_code != 200:
            raise click.ClickException(response.text)
