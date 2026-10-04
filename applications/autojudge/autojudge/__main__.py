import logging
import signal
import threading
import time

from autojudge.api import start_flask_app
from autojudge.config.env import env
from autojudge.worker import Worker

logging.basicConfig(
    level=logging.DEBUG if env.debug else logging.INFO,
    format="ts=%(asctime)s level=%(levelname)s logger=%(name)s msg=%(message)s",
)


is_active = True


def sigterm(signum, frame):
    global is_active
    logging.info("Received SIGTERM, shutting down gracefully...")
    is_active = False


signal.signal(signal.SIGTERM, sigterm)

if __name__ == "__main__":
    logging.info("Starting judge worker")

    api = threading.Thread(target=start_flask_app, daemon=True)
    api.start()
    worker = Worker()
    worker_thread = threading.Thread(target=worker.start, daemon=True)
    worker_thread.start()

    while is_active:
        time.sleep(1)

    worker.stop()

    worker_thread.join()
    api.join()

    logging.info("Judge worker stopped")
