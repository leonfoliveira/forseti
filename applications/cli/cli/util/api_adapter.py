import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import keyring
import keyring.errors
import requests
import typer

from cli.composition import console
from cli.config import __certs_dir__
from cli.util.docker.docker_stack import DockerStack
from cli.util.theme import Messages


class ApiAdapter:
    KEYRING_SERVICE_NAME = "forseti-cli"
    KEYRING_SESSION_KEY = "session"

    SESSION_ID_COOKIE = "session_id"
    CSRF_HEADER = "x-csrf-token"

    def __init__(
        self,
        docker_stack: DockerStack,
        root_password: Optional[str] = None,
    ):
        domain = docker_stack.config["global"]["domain"]
        https = docker_stack.config["global"].get("https", False)

        self.api_url = f"{'https' if https else 'http'}://api.{domain}"
        self.root_password = root_password
        self.root_ca_file = os.path.join(__certs_dir__, "rootCA.pem") if https else None

    def create_contest(self, slug: str) -> dict:
        session = self._get_session()
        url = f"{self.api_url}/v1/root/contests"
        response = requests.post(
            url,
            cookies={self.SESSION_ID_COOKIE: session["id"]},
            headers={self.CSRF_HEADER: session["csrfToken"]},
            json={
                "slug": slug,
                "title": "New Contest",
                "languages": ["CPP_17", "JAVA_21", "PYTHON_312"],
                "startAt": "2100-01-01T00:00:00Z",
                "endAt": "2100-01-01T23:59:59Z",
            },
            verify=self.root_ca_file,
        )
        if response.status_code != 200:
            raise Exception(f"{response.json().get('message', '')}")
        return response.json()

    def find_all_contests(self) -> list[dict]:
        session = self._get_session()
        url = f"{self.api_url}/v1/root/contests"
        response = requests.get(
            url,
            cookies={self.SESSION_ID_COOKIE: session["id"]},
            headers={self.CSRF_HEADER: session["csrfToken"]},
            verify=self.root_ca_file,
        )
        response.raise_for_status()
        return response.json()

    def delete_contest(self, contest_id: str) -> None:
        session = self._get_session()
        url = f"{self.api_url}/v1/root/contests/{contest_id}"
        response = requests.delete(
            url,
            cookies={self.SESSION_ID_COOKIE: session["id"]},
            headers={self.CSRF_HEADER: session["csrfToken"]},
            verify=self.root_ca_file,
        )
        response.raise_for_status()

    def _get_session(self) -> dict:
        session = self._get_cached_session()
        if session is not None:
            return session
        return self._authenticate_root()

    def _authenticate_root(self) -> dict:
        if not self.root_password:
            self.root_password = typer.prompt("Enter root password", hide_input=True)

        url = f"{self.api_url}/v1/root:sign-in"
        response = requests.post(
            url, json={"password": self.root_password}, verify=self.root_ca_file
        )
        response.raise_for_status()
        session = response.json()
        self._cache_session(session)
        return session

    def _cache_session(self, session: dict) -> None:
        try:
            keyring.set_password(
                self.KEYRING_SERVICE_NAME, self.KEYRING_SESSION_KEY, json.dumps(session)
            )
        except keyring.errors.NoKeyringError:
            console.print(
                Messages.warning(
                    "Warning: No keyring backend available, session will not be cached."
                )
            )

    def _get_cached_session(self) -> Optional[dict]:
        try:
            session_json = keyring.get_password(
                self.KEYRING_SERVICE_NAME, self.KEYRING_SESSION_KEY
            )
            if session_json:
                session = json.loads(session_json)
                if datetime.fromisoformat(
                    session.get("expiresAt")[:-1] + "+00:00"
                ) >= datetime.now(timezone.utc):
                    return session
            return None
        except keyring.errors.NoKeyringError:
            console.print(
                Messages.warning(
                    "Warning: No keyring backend available, session cannot be "
                    "retrieved from cache."
                )
            )
            return None
