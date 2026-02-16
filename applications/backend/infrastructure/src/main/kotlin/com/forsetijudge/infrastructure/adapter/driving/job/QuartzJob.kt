package com.forsetijudge.infrastructure.adapter.driving.job

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.IdUtil
import com.forsetijudge.core.domain.model.RequestContext
import com.forsetijudge.core.port.driving.usecase.session.RefreshSessionUseCase
import io.opentelemetry.api.trace.Span
import org.quartz.DisallowConcurrentExecution
import org.quartz.JobExecutionContext
import org.quartz.JobExecutionException
import org.quartz.PersistJobDataAfterExecution
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.slf4j.MDC
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.scheduling.quartz.QuartzJobBean
import java.io.Serializable
import java.util.UUID

@PersistJobDataAfterExecution
@DisallowConcurrentExecution
abstract class QuartzJob<TPayload : Serializable>(
    private val memberId: UUID,
) : QuartzJobBean() {
    @Autowired
    private lateinit var refreshSessionUseCase: RefreshSessionUseCase

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Value("\${spring.quartz.max-retries}")
    private lateinit var maxRetries: Integer

    protected val logger: Logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Executes the job and handles any exceptions that may occur during execution.
     * If an exception is thrown, it will be wrapped in a JobExecutionException and the job will be refired immediately.
     *
     * @param context The JobExecutionContext provided by the Quartz scheduler, containing information about the job execution environment.
     */
    override fun executeInternal(context: JobExecutionContext) {
        val traceId = IdUtil.getTraceId()
        val currentSpan = Span.current()
        currentSpan.setAttribute("trace_id", traceId)
        MDC.put("trace_id", traceId)

        logger.info("Starting job ${this::class.java.simpleName}")

        val dataMap = context.mergedJobDataMap
        val id = dataMap.getString("id")
        val payloadJson = dataMap.getString("payload")
        var retries = dataMap.getInt("retries")

        logger.info("Job id: {}, payload: {}, retries: {}", id, payloadJson, retries)

        val payload = objectMapper.readValue(payloadJson, getPayloadType())

        initRequestContext()

        try {
            logger.info("Handling job with id: {}", id)
            handlePayload(payload)
            logger.info("Finished handling job")
        } catch (ex: Exception) {
            logger.error("Error thrown from job {}: {}", this.javaClass.simpleName, ex.message)

            retries++
            dataMap.put("retries", retries)

            if (retries < maxRetries.toInt()) {
                val e2 = JobExecutionException(ex)
                try {
                    Thread.sleep(30000)
                } catch (ignored: InterruptedException) {
                }

                e2.setRefireImmediately(true)
                throw e2
            } else {
                logger.error("Max retries reached")
                throw ex
            }
        }
    }

    private fun initRequestContext() {
        val session = refreshSessionUseCase.refresh(memberId)
        RequestContext.getContext().session = session
        RequestContext.getContext().traceId = Span.current().spanContext.traceId
    }

    /**
     * Method to get the payload type for deserialization.
     */
    protected abstract fun getPayloadType(): Class<TPayload>

    /**
     * Method to handle the payload after deserialization.
     */
    abstract fun handlePayload(payload: TPayload)
}
