package com.forsetijudge.core.application.util

import io.prometheus.metrics.core.metrics.Counter
import io.prometheus.metrics.core.metrics.Histogram
import io.prometheus.metrics.core.metrics.Info
import io.prometheus.metrics.model.snapshots.Unit

object CoreMetrics {
    val INFO: Info =
        Info
            .builder()
            .name("forseti_info")
            .help("Forseti application information")
            .labelNames("version", "environment")
            .register()

    val RECEIVED_SUBMISSION: Counter =
        Counter
            .builder()
            .name("forseti_received_submission_total")
            .help("Total number of received submissions")
            .register()

    // Total number of successfully judged submissions
    val SUCCESSFUL_SUBMISSION: Counter =
        Counter
            .builder()
            .name("forseti_successful_submission_total")
            .help("Total number of successfully judged submissions")
            .labelNames("answer")
            .register()

    // Total number of failed judged submissions
    val FAILED_SUBMISSION: Counter =
        Counter
            .builder()
            .name("forseti_failed_submission_total")
            .help("Total number of failed judged submissions")
            .register()

    // Summary of submission run time
    val SUBMISSION_RUN_TIME_SECONDS: Histogram =
        Histogram
            .builder()
            .name("forseti_submission_run_time_seconds")
            .help("Histogram of submission run time in seconds")
            .unit(Unit.SECONDS)
            .register()
}
