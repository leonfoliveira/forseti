import logging
import threading

from autojudge.config.env import env
from autojudge.worker import Worker

bind = f"0.0.0.0:{env.port}"
workers = env.workers
worker_class = "sync"

logging.basicConfig(
    level=logging.DEBUG if env.debug else logging.INFO,
    format="ts=%(asctime)s level=%(levelname)s logger=%(name)s msg=%(message)s",
)

_worker_instance = None
_worker_thread = None

def post_fork(server, worker):
    global _worker_instance, _worker_thread
    logging.info(f"Gunicorn worker spawned (pid: {worker.pid}), starting judge worker...")

    _worker_instance = Worker()
    _worker_thread = threading.Thread(target=_worker_instance.start, daemon=True)
    _worker_thread.start()
    

def worker_exit(server, worker):
    global _worker_instance, _worker_thread
    logging.info(f"Gunicorn worker exiting (pid: {worker.pid}), stopping judge worker...")

    if _worker_instance:
        _worker_instance.stop()

    if _worker_thread and _worker_thread.is_alive():
        _worker_thread.join(timeout=5)
        