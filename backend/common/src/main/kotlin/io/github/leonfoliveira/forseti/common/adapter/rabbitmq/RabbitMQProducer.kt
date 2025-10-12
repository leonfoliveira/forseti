package io.github.leonfoliveira.forseti.common.adapter.rabbitmq

import com.fasterxml.jackson.databind.ObjectMapper
import io.github.leonfoliveira.forseti.common.adapter.rabbitmq.message.RabbitMQMessage
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.beans.factory.annotation.Autowired
import java.io.Serializable

abstract class RabbitMQProducer<TPayload : Serializable>(
    private val exchange: String,
    private val routingKey: String,
) {
    @Autowired
    private lateinit var rabbitTemplate: RabbitTemplate

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    private val logger = LoggerFactory.getLogger(this::class.java)

    protected fun produce(payload: TPayload) {
        val message = RabbitMQMessage(payload = payload)
        val jsonString = objectMapper.writeValueAsString(message)

        logger.info("Sending message: {}", message)

        rabbitTemplate.convertAndSend(exchange, routingKey, jsonString)
    }
}
