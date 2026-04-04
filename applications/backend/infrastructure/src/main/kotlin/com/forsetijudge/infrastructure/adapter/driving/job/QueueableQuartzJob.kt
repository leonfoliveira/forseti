package com.forsetijudge.infrastructure.adapter.driving.job

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.infrastructure.adapter.driven.rabbitmq.RabbitMQProducer
import com.forsetijudge.infrastructure.adapter.dto.quartz.body.QueueableJobMessageBody
import com.forsetijudge.infrastructure.adapter.dto.rabbitmq.RabbitMQMessage
import org.quartz.DisallowConcurrentExecution
import org.quartz.JobExecutionContext
import org.quartz.JobExecutionException
import org.quartz.PersistJobDataAfterExecution
import org.springframework.beans.factory.annotation.Value
import org.springframework.scheduling.quartz.QuartzJobBean
import java.util.UUID

@PersistJobDataAfterExecution
@DisallowConcurrentExecution
class QueueableQuartzJob(
    private val rabbitMQProducer: RabbitMQProducer,
    private val objectMapper: ObjectMapper,
    @Value("\${spring.quartz.max-retries}")
    private val maxRetries: Int,
) : QuartzJobBean() {
    private val logger = SafeLogger(this::class)

    private val bodyTypeReference = object : TypeReference<QueueableJobMessageBody>() {}

    /**
     * Executes the job by reading the necessary information from the JobExecutionContext,
     * deserializing the body of the message, and producing a message to RabbitMQ using the RabbitMQProducer.
     *
     * @param context The JobExecutionContext provided by the Quartz scheduler, containing information about the job execution environment.
     */
    public override fun executeInternal(context: JobExecutionContext) {
        val dataMap = context.mergedJobDataMap
        val id = dataMap.getString("id")
        val contestId =
            if (!(dataMap.get("contestId") as? String).isNullOrEmpty()) {
                UUID.fromString(dataMap.getString("contestId"))
            } else {
                null
            }
        val traceId = dataMap.getString("traceId")
        val jsonBody = dataMap.getString("body")
        val body = objectMapper.readValue(jsonBody, bodyTypeReference)

        logger.info("Handling job with id: $id, body: $body")

        logger.info("Producing message to RabbitMQ exchange: ${body.exchange}")
        rabbitMQProducer.produce(
            RabbitMQMessage(
                contestId = contestId,
                traceId = traceId,
                exchange = body.exchange,
                routingKey = body.routingKey,
                body = body.body,
            ),
        )
        logger.info("Finished handling job")
    }
}
