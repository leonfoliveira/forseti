package com.forsetijudge.infrastructure.adapter.driven.rabbitmq

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.infrastructure.adapter.dto.message.RabbitMQMessage
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.beans.factory.annotation.Autowired
import java.io.Serializable

abstract class RabbitMQProducer<TPayload : Serializable>(
    private val exchange: String,
    private val routingKey: String = "",
) {
    @Autowired
    private lateinit var rabbitTemplate: RabbitTemplate

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    private val logger = SafeLogger(this::class)

    /**
     * Serializes a payload and sends it to the configured RabbitMQ exchange with the specified routing key.
     *
     * @param payload The payload to be sent in the message.
     */
    fun produce(payload: TPayload) {
        val message =
            RabbitMQMessage(
                id = IdGenerator.getUUID(),
                contestId = ExecutionContext.getContestIdNullable(),
                traceId = ExecutionContext.get().traceId,
                payload = payload,
            )
        val jsonString = objectMapper.writeValueAsString(message)

        logger.info("Sending message: $jsonString")

        rabbitTemplate.convertAndSend(exchange, routingKey, jsonString)
    }
}
