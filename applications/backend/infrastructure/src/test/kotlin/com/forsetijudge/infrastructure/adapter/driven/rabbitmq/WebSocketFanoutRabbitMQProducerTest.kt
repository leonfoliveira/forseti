package com.forsetijudge.infrastructure.adapter.driven.rabbitmq

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.producer.payload.WebSocketFanoutPayload
import com.forsetijudge.infrastructure.adapter.dto.message.RabbitMQMessage
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.slot
import io.mockk.verify
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.test.context.SpringBootTest
import java.io.Serializable

@SpringBootTest(classes = [WebSocketFanoutRabbitMQProducer::class, JacksonConfig::class])
class WebSocketFanoutRabbitMQProducerTest(
    @MockkBean(relaxed = true)
    private val rabbitTemplate: RabbitTemplate,
    @Value("\${spring.rabbitmq.exchange.websocket-exchange}")
    private val exchange: String,
    private val sut: WebSocketFanoutRabbitMQProducer,
    private val objectMapper: ObjectMapper,
) : FunSpec({
        val contestId = IdGenerator.getUUID()
        val traceId = IdGenerator.getTraceId()

        beforeEach {
            ExecutionContext.start(
                contestId = contestId,
                traceId = traceId,
            )
        }

        test("should produce message to RabbitMQ") {
            val payload = WebSocketFanoutPayload(destination = "/topic/test", body = mapOf("foo" to "bar") as Serializable)

            sut.produce(payload)

            val jsonMessageSlot = slot<String>()
            verify { rabbitTemplate.convertAndSend(exchange, "", capture(jsonMessageSlot)) }
            val jsonMessage = jsonMessageSlot.captured
            val typeRef =
                object :
                    TypeReference<
                        RabbitMQMessage<WebSocketFanoutPayload>,
                        >() {}

            val message = objectMapper.readValue(jsonMessage, typeRef)
            message.contestId shouldBe contestId
            message.traceId shouldBe traceId
            message.payload shouldBe payload
        }
    })
