
import logging
import threading

from autojudge.config.env import env
from autojudge.worker import Worker
from autojudge.api import start_flask_app

bind = f"0.0.0.0:{env.port}"
workers = env.workers
worker_class = "sync"

logging.basicConfig(
    level=logging.DEBUG if env.debug else logging.INFO,
    format="ts=%(asctime)s level=%(levelname)s logger=%(name)s msg=%(message)s",
)

_worker_instances = {}


def when_ready(server):
    logging.info("Starting health-check API...")
    threading.Thread(
        target=start_flask_app,
        daemon=True,
        name="health-api",
    ).start()


def post_fork(server, worker):
    logging.info(
        f"Gunicorn worker spawned (pid: {worker.pid}), starting judge worker..."
    )
    instance = Worker()
    _worker_instances[worker.pid] = instance
    threading.Thread(
        target=instance.start,
        daemon=True,
        name=f"judge-worker-{worker.pid}",
    ).start()


def worker_exit(server, worker):
    logging.info(
        f"Gunicorn worker exiting (pid: {worker.pid}), stopping judge worker..."
    )
    instance = _worker_instances.pop(worker.pid, None)
    if instance:
        instance.stop()
