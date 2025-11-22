package live.forseti.core.config

import io.prometheus.metrics.exporter.servlet.jakarta.PrometheusMetricsServlet
import io.prometheus.metrics.instrumentation.jvm.JvmMetrics
import live.forseti.core.application.util.CoreMetrics
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.boot.web.servlet.ServletRegistrationBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.event.EventListener

@Configuration
class PrometheusClientConfig(
    @Value("\${spring.application.version}")
    private val version: String,
    @Value("\${spring.profiles.active}")
    private val environment: String,
) {
    /**
     * Registers the Prometheus metrics servlet at the "/metrics" endpoint.
     */
    @Bean
    fun prometheusMetricsEndpoint(): ServletRegistrationBean<PrometheusMetricsServlet?> =
        ServletRegistrationBean<PrometheusMetricsServlet?>(PrometheusMetricsServlet(), "/metrics/*")

    /**
     * Initializes JVM and core application metrics after the application is ready.
     */
    @EventListener(ApplicationReadyEvent::class)
    fun initializeMetrics() {
        JvmMetrics.builder().register()
        CoreMetrics.INFO.setLabelValues(version, environment)
    }
}
