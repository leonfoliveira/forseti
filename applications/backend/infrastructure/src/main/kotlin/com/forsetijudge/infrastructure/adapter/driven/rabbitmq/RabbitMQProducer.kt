package com.forsetijudge.infrastructure.adapter.driven.rabbitmq

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.infrastructure.adapter.dto.rabbitmq.RabbitMQMessage
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
class RabbitMQProducer(
    private var rabbitTemplate: RabbitTemplate,
    private var objectMapper: ObjectMapper,
) {
    private val logger = SafeLogger(this::class)

    /**
     * Serializes a payload and sends it to the configured RabbitMQ exchange with the specified routing key.
     *
     * @param message The message payload to be sent.
     */
    fun produce(message: RabbitMQMessage<*>) {
        val jsonPayload = objectMapper.writeValueAsString(message.body)

        logger.info(
            "Sending message with id: ${message.id} to exchange: ${message.exchange} with routing key: ${message.routingKey} and body: $jsonPayload",
        )

        rabbitTemplate.convertAndSend(message.exchange, message.routingKey, jsonPayload) {
            it.messageProperties.headers["id"] = message.id
            it.messageProperties.headers["x-trace-id"] = message.traceId
            it.messageProperties.priority = message.priority
            it
        }
    }
}
