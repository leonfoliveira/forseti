package com.forsetijudge.core.util

import io.opentelemetry.api.GlobalOpenTelemetry
import io.opentelemetry.api.metrics.LongCounter

@SkipCoverage
object Metrics {
    private val meter =
        GlobalOpenTelemetry
            .get()
            .getMeter("com.forsetijudge")

    val submissionsCreated: LongCounter =
        meter
            .counterBuilder("core.submissions.created")
            .setDescription("Number of submissions created")
            .build()

    val submissionsJudged: LongCounter =
        meter
            .counterBuilder("core.submissions.judged")
            .setDescription("Number of submissions judged")
            .build()

    val submissionsFailed: LongCounter =
        meter
            .counterBuilder("core.submissions.failed")
            .setDescription("Number of submissions failed")
            .build()
}
