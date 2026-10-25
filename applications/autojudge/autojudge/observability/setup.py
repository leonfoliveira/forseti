import logging

from opentelemetry import metrics, trace
from opentelemetry._logs import set_logger_provider
from opentelemetry.exporter.otlp.proto.http._log_exporter import OTLPLogExporter
from opentelemetry.exporter.otlp.proto.http.metric_exporter import OTLPMetricExporter
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

from config.env import env


def configure_otel():
    if env.otel_sdk_disabled:
        return None

    resource = Resource.create({
        "service.name": env.otel_service_name,
        "service.version": env.version,
        "deployment.environment.name": env.environment,
    })

    tracer_provider = TracerProvider(resource=resource)
    tracer_provider.add_span_processor(
        BatchSpanProcessor(OTLPSpanExporter(
            endpoint=env.otel_exporter_otlp_endpoint,
            protocol=env.otel_exporter_otlp_protocol,
        ))
    )
    trace.set_tracer_provider(tracer_provider)

    metric_reader = PeriodicExportingMetricReader(
        OTLPMetricExporter(
            endpoint=env.otel_exporter_otlp_endpoint,
            protocol=env.otel_exporter_otlp_protocol,
        ),
        export_interval_millis=15_000,
    )
    meter_provider = MeterProvider(
        resource=resource,
        metric_readers=[metric_reader],
    )
    metrics.set_meter_provider(meter_provider)

    logger_provider = LoggerProvider(resource=resource)
    logger_provider.add_log_record_processor(
        BatchLogRecordProcessor(OTLPLogExporter(
            endpoint=env.otel_exporter_otlp_endpoint,
            protocol=env.otel_exporter_otlp_protocol,
        ))
    )
    set_logger_provider(logger_provider)

    handler = LoggingHandler(
        level=logging.NOTSET,
        logger_provider=logger_provider,
    )
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    root.addHandler(handler)

    return {
        "tracer_provider": tracer_provider,
        "meter_provider": meter_provider,
        "logger_provider": logger_provider,
    }
