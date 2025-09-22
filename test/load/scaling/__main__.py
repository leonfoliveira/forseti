import threading
import time
import logging
import random
import re
import requests
import os
import warnings
from urllib3.exceptions import InsecureRequestWarning

logging.basicConfig(level=logging.INFO)
warnings.simplefilter("ignore", InsecureRequestWarning)


root_password = os.getenv("ROOT_PASSWORD")
contest_slug = os.getenv("CONTEST_SLUG")
delay = float(os.getenv("DELAY"))
period = float(os.getenv("PERIOD"))
runners = int(os.getenv("RUNNERS"))

api_url = "https://api.judge.app"
code = "print(int(input()) * 2)"


def get_random_ip() -> str:
    return ".".join(str(random.randint(0, 255)) for _ in range(4))


def make_request(method: str, path: str, **kwargs) -> requests.Response:
    try:
        if "headers" not in kwargs:
            kwargs["headers"] = {}
        kwargs["headers"]["X-Forwarded-For"] = get_random_ip()
        response = requests.request(
            method, f"{api_url}{path}", verify=False, **kwargs)
        response.raise_for_status()
        return response
    except requests.RequestException:
        logging.error(
            f"Request failed: [{method}] {path} - {response.status_code} - {response.text}")
        raise


def find_contest_metadata() -> dict:
    response = make_request(
        "GET", f"/v1/contests/slug/{contest_slug}/metadata")
    return response.json()


def sign_in(contest_id) -> str:
    response = make_request("POST", f"/v1/contests/{contest_id}/sign-in", json={
        "login": "root",
        "password": root_password,
    })
    cookies = response.headers["Set-Cookie"]
    return re.search(r"(?<=session_id=)[^;]+", cookies).group(0)


def find_contest(contest_id: str, session_id: str) -> dict:
    response = make_request("GET", f"/v1/contests/{contest_id}",
                            cookies={"session_id": session_id})
    return response.json()


def upload_attachment(contest_id: str, session_id: str, code: str) -> dict:
    response = make_request("POST", f"/v1/contests/{contest_id}/attachments/SUBMISSION_CODE", files={
                            "file": ("code.py", code, "text/x-python")}, cookies={"session_id": session_id})
    return response.json()


def create_submission(contest_id: str, session_id: str, problem_id: str, attachment_id: str) -> dict:
    response = make_request("POST", f"/v1/contests/{contest_id}/submissions", json={
        "problemId": problem_id,
        "language": "PYTHON_3_12",
        "code": {"id": attachment_id}
    }, cookies={"session_id": session_id})
    return response.json()


should_stop = False
acts = [0] * runners


def print_acts():
    print("\rActs:", acts, end="", flush=True)


def runner(index: int):
    contest_metadata = find_contest_metadata()
    contest_id = contest_metadata["id"]
    time.sleep(delay)
    session_id = sign_in(contest_id)
    time.sleep(delay)

    while not should_stop:
        contest = find_contest(contest_id, session_id)
        time.sleep(delay)
        problem_id = contest["problems"][0]["id"]
        time.sleep(delay)
        attachment = upload_attachment(contest_id, session_id, code)
        time.sleep(delay)
        create_submission(
            contest_id, session_id, problem_id, attachment["id"])
        time.sleep(delay)
        acts[index] += 1
        print_acts()


if __name__ == "__main__":
    for index in range(runners):
        threading.Thread(target=runner, args=[index]).start()
        time.sleep(random.uniform(0, delay))
    logging.info(f"Started {runners} runners")
    time.sleep(period)
    should_stop = True
