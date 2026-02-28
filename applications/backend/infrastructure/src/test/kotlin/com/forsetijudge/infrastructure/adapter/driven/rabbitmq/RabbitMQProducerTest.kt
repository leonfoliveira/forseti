package com.forsetijudge.infrastructure.adapter.driven.rabbitmq

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.infrastructure.adapter.dto.rabbitmq.RabbitMQMessage
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify
import org.springframework.amqp.core.MessagePostProcessor
import org.springframework.amqp.rabbit.core.RabbitTemplate
import java.io.Serializable

class RabbitMQProducerTest :
    FunSpec({
        val rabbitTemplate = mockk<RabbitTemplate>(relaxed = true)
        val objectMapper = ObjectMapper()

        val sut = RabbitMQProducer(rabbitTemplate, objectMapper)

        beforeTest {
            clearAllMocks()
        }

        test("produce should serialize message and send to RabbitMQ") {
            val message =
                RabbitMQMessage(
                    exchange = "test-exchange",
                    routingKey = "test-routing-key",
                    body = mapOf("key" to "value") as Serializable,
                    priority = 5,
                )

            sut.produce(message)

            verify {
                rabbitTemplate.convertAndSend(
                    "test-exchange",
                    "test-routing-key",
                    objectMapper.writeValueAsString(message.body),
                    any<MessagePostProcessor>(),
                )
            }
        }
    })
