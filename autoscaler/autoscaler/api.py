import logging

from flask import Flask, Response, jsonify
from prometheus_client import REGISTRY, generate_latest

from autoscaler.queue_monitor import QueueMonitor
from autoscaler.service_monitor import ServiceMonitor

app = Flask(__name__)

logging.getLogger("werkzeug").setLevel(logging.WARNING)


def start_flask_app(
    queue_monitor: QueueMonitor, service_monitor: ServiceMonitor, port: int
):
    @app.route("/health")
    def health_check():
        try:
            # Check if the scaler components are healthy
            queue_monitor.get_number_of_messages()  # Test SQS connection
            service_monitor.get_current_replicas()  # Test Docker connection

            return jsonify({"status": "healthy"}), 200
        except Exception as e:
            logging.error(f"Health check failed: {e}")
            return jsonify({"status": "unhealthy"}), 503

    @app.route("/metrics")
    def metrics():
        # Generate Prometheus metrics
        metrics_output = generate_latest(REGISTRY)
        return Response(
            metrics_output, mimetype="text/plain; version=0.0.4; charset=utf-8"
        )

    logging.info(f"Flask server starting on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False, use_reloader=False)
