import logging
import math
import time

from prometheus_client import Counter, Gauge

from autoscaler.queue_monitor import QueueMonitor
from autoscaler.service_monitor import ServiceMonitor

CURRENT_REPLICAS = Gauge(
    "autoscaler_current_replicas", "Current number of replicas", ["service_name"]
)
DESIRED_REPLICAS = Gauge(
    "autoscaler_desired_replicas", "Desired number of replicas", ["service_name"]
)
SCALING_COUNT = Counter(
    "autoscaler_scaling_count",
    "Number of scaling actions",
    ["service_name", "direction"],
)
FAIL_COUNT = Counter(
    "autoscaler_fail_count", "Number of failed scaling actions", ["service_name"]
)


class Scaler:
    def __init__(
        self,
        queue_monitor: QueueMonitor,
        service_monitor: ServiceMonitor,
        cooldown: int,
        messages_per_replica: int,
        min_replicas: int,
        max_replicas: int,
    ):
        self.queue_monitor = queue_monitor
        self.service_monitor = service_monitor
        self.cooldown = cooldown
        self.messages_per_replica = messages_per_replica
        self.min_replicas = min_replicas
        self.max_replicas = max_replicas
        self.last_scale_time: float | None = None
        self.labels = {
            "service_name": service_monitor.service_name,
        }

    def scale(self):
        try:
            messages = self.queue_monitor.get_number_of_messages()
            current_replicas = self.service_monitor.get_current_replicas()

            desired_replicas = (
                math.ceil(messages / self.messages_per_replica)
                if self.messages_per_replica > 0
                else 0
            )
            desired_replicas = max(self.min_replicas, desired_replicas)
            desired_replicas = min(self.max_replicas, desired_replicas)

            CURRENT_REPLICAS.labels(**self.labels).set(current_replicas)
            DESIRED_REPLICAS.labels(**self.labels).set(desired_replicas)

            is_cooling_down = self.last_scale_time is not None and (
                time.time() - self.last_scale_time < self.cooldown
            )
            logging.info(
                f"Messages: {messages}, "
                f"Current replicas: {current_replicas}, "
                f"Desired replicas: {desired_replicas}, "
                f"Cooling down: {is_cooling_down}"
            )
            if desired_replicas != current_replicas and not is_cooling_down:
                direction = "up" if desired_replicas > current_replicas else "down"
                logging.info(
                    f"Scaling {direction} service {self.service_monitor.service_name} "
                    f"from {current_replicas} to {desired_replicas} replicas"
                )
                self.service_monitor.scale(desired_replicas)
                SCALING_COUNT.labels(**self.labels, direction=direction).inc()
                self.last_scale_time = time.time()
        except Exception as e:
            logging.error(f"Error scaling: {e}")
            FAIL_COUNT.labels(**self.labels).inc()
