import logging

from flask import Flask, Response, jsonify
from prometheus_client import REGISTRY, generate_latest

from autojudge.config.aws_config import s3_client, sqs_client
from autojudge.config.env import env

app = Flask(__name__)

logging.getLogger("werkzeug").setLevel(logging.WARNING)


def start_flask_app():
    @app.route("/health")
    def health_check():
        try:
            s3_client.list_buckets()
            sqs_client.get_queue_url(QueueName=env.aws.sqs.submission_queue)
            return jsonify({"status": "healthy"}), 200
        except Exception as e:
            logging.error(f"Health check failed: {e}")
            return jsonify({"status": "unhealthy"}), 503

    @app.route("/metrics")
    def metrics():
        metrics_output = generate_latest(REGISTRY)
        return Response(
            metrics_output, mimetype="text/plain; version=0.0.4; charset=utf-8"
        )

    logging.info(f"Flask server starting on port {env.server.port}")
    app.run(host="0.0.0.0", port=env.server.port, debug=False, use_reloader=False)
