import logging


class Collector:
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)

    async def collect(self):
        self.logger.info("Collecting...")
        try:
            self._collect()
            self.logger.info("Collected")
        except Exception as e:
            self.logger.error(f"Error during metrics collection: {e}")
            raise e

    def _collect(self):
        ...
