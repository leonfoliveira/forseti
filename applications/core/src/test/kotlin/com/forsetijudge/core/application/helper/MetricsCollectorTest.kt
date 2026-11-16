package com.forsetijudge.core.application.helper

import com.forsetijudge.core.util.IdGenerator
import io.opentelemetry.api.GlobalOpenTelemetry
import io.opentelemetry.api.common.AttributeKey
import io.opentelemetry.sdk.OpenTelemetrySdk
import io.opentelemetry.sdk.metrics.SdkMeterProvider
import io.opentelemetry.sdk.testing.exporter.InMemoryMetricReader
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test

class MetricsCollectorTest {
    companion object {
        private lateinit var metricReader: InMemoryMetricReader

        @BeforeAll
        @JvmStatic
        fun setupOpenTelemetry() {
            GlobalOpenTelemetry.resetForTest()
            metricReader = InMemoryMetricReader.create()
            val meterProvider =
                SdkMeterProvider
                    .builder()
                    .registerMetricReader(metricReader)
                    .build()
            val sdk =
                OpenTelemetrySdk
                    .builder()
                    .setMeterProvider(meterProvider)
                    .build()
            GlobalOpenTelemetry.set(sdk)
        }
    }

    private val metricsCollector = MetricsCollector()

    @Test
    fun `should incrementSubmissionsCreated`() {
        val contestId = IdGenerator.getUUID()

        metricsCollector.incrementSubmissionsCreated(contestId)

        val metrics = metricReader.collectAllMetrics()
        val contestIdKey = AttributeKey.stringKey("contestId")

        val createdMetric = metrics.first { it.name == "core.submissions.created" }
        val createdPoint =
            createdMetric.longSumData.points.first {
                it.attributes.get(contestIdKey) == contestId.toString()
            }
        assertEquals(1L, createdPoint.value)
    }

    @Test
    fun `should incrementSubmissionsJudged`() {
        val contestId = IdGenerator.getUUID()

        metricsCollector.incrementSubmissionsJudged(contestId)

        val metrics = metricReader.collectAllMetrics()
        val contestIdKey = AttributeKey.stringKey("contestId")

        val judgedMetric = metrics.first { it.name == "core.submissions.judged" }
        val judgedPoint =
            judgedMetric.longSumData.points.first {
                it.attributes.get(contestIdKey) == contestId.toString()
            }
        assertEquals(1L, judgedPoint.value)
    }

    @Test
    fun `should incrementSubmissionsFailed`() {
        val contestId = IdGenerator.getUUID()

        metricsCollector.incrementSubmissionsFailed(contestId)

        val metrics = metricReader.collectAllMetrics()
        val contestIdKey = AttributeKey.stringKey("contestId")

        val failedMetric = metrics.first { it.name == "core.submissions.failed" }
        val failedPoint =
            failedMetric.longSumData.points.first {
                it.attributes.get(contestIdKey) == contestId.toString()
            }
        assertEquals(1L, failedPoint.value)
    }
}
