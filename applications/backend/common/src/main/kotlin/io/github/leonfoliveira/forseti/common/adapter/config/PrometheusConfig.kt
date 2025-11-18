package io.github.leonfoliveira.forseti.common.adapter.config

import io.prometheus.metrics.exporter.servlet.jakarta.PrometheusMetricsServlet
import io.prometheus.metrics.instrumentation.jvm.JvmMetrics
import org.springframework.boot.web.servlet.ServletRegistrationBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class PrometheusConfig {
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
}
