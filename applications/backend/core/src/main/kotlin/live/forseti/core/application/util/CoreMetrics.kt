package live.forseti.core.application.util

import io.prometheus.metrics.core.metrics.Info

class CoreMetrics {
    companion object {
        val FORSETI_INFO: Info =
            Info
                .builder()
                .name("forseti_info")
                .help("Forseti application information")
                .labelNames("version", "environment")
                .register()
    }

    private constructor() {}
}
