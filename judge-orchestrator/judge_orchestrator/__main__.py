from prometheus_client import start_http_server
import asyncio
import logging
import sys

from .metric.docker_collector import DockerCollector
from .metric.postgres_collector import PostgresCollector
from .metric.s3_collector import S3Collector
from .metric.sqs_collector import SqsCollector
from .config import CLOCK


logging.basicConfig(stream=sys.stdout, level=logging.INFO,
                    format="%(asctime)s %(levelname)s %(name)s - %(message)s")


metrics_collectors = [
    DockerCollector(),
    PostgresCollector(),
    S3Collector(),
    SqsCollector(),
]


async def collect_metrics():
    logging.info("Started collecting metrics...")
    await asyncio.gather(*(collector.collect() for collector in metrics_collectors))
    logging.info("Finished collecting metrics")


async def main():
    start_http_server(7000, addr="0.0.0.0")
    while True:
        asyncio.create_task(collect_metrics())
        await asyncio.sleep(CLOCK)

if __name__ == "__main__":
    asyncio.run(main())
