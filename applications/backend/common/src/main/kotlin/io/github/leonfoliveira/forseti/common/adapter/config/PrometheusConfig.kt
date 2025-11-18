package io.github.leonfoliveira.forseti.common.adapter.config

import io.github.leonfoliveira.forseti.common.application.util.CommonMetrics
import io.prometheus.metrics.exporter.servlet.jakarta.PrometheusMetricsServlet
import io.prometheus.metrics.instrumentation.jvm.JvmMetrics
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.boot.web.servlet.ServletRegistrationBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.event.EventListener

@Configuration
class PrometheusConfig(
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
     * Registers JVM metrics for monitoring.
     */
    @Bean
    fun jvmMetrics(): JvmMetrics = JvmMetrics()

    @EventListener(ApplicationReadyEvent::class)
    fun initializeMetrics() {
        CommonMetrics.FORSETI_INFO.setLabelValues(version, environment)
    }
}
