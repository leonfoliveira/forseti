package com.forsetijudge.core.util

import io.prometheus.metrics.core.metrics.Info

@SkipCoverage
object Metrics {
    val INFO: Info =
        Info
            .builder()
            .name("forseti_info")
            .help("Forseti application information")
            .labelNames("version")
            .register()
}
