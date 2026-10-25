from opentelemetry import metrics

meter = metrics.get_meter("forseti.autojudge")

submissions_received = meter.create_counter(
    "submissions.received",
    description="Number of submissions received",
)

submissions_duration = meter.create_histogram(
    "submissions.duration",
    description="Duration of submissions processing",
)

submissions_judged = meter.create_counter(
    "submissions.judged",
    description="Number of submissions judged",    
)

submissions_failed = meter.create_counter(
    "submissions.failed",
    description="Number of submissions failed",
)