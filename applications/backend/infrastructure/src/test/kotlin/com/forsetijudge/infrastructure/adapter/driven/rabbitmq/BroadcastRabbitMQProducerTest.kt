package com.forsetijudge.infrastructure.adapter.driven.rabbitmq

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.infrastructure.adapter.driven.redis.BroadcastEventRedisStore
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

@SpringBootTest(classes = [BroadcastRabbitMQProducer::class, JacksonConfig::class])
class BroadcastRabbitMQProducerTest(
    @MockkBean(relaxed = true)
    private val rabbitTemplate: RabbitTemplate,
    @Value("\${spring.rabbitmq.exchange.websocket-exchange}")
    private val exchange: String,
    @MockkBean(relaxed = true)
    private val broadCastEventRedisStore: BroadcastEventRedisStore,
    private val sut: BroadcastRabbitMQProducer,
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
            val payload =
                BroadcastEvent(
                    room = "/topic/test",
                    name = "TICKET_CREATED",
                    data =
                        mapOf("foo" to "bar") as Serializable,
                )

            sut.produce(payload)

            val jsonMessageSlot = slot<String>()
            verify { rabbitTemplate.convertAndSend(exchange, "", capture(jsonMessageSlot)) }
            val jsonMessage = jsonMessageSlot.captured
            val typeRef =
                object :
                    TypeReference<
                        RabbitMQMessage<BroadcastEvent>,
                    >() {}

            val message = objectMapper.readValue(jsonMessage, typeRef)
            message.contestId shouldBe contestId
            message.traceId shouldBe traceId
            message.payload.room shouldBe payload.room
            message.payload.name shouldBe payload.name
            message.payload.data shouldBe payload.data
            verify { broadCastEventRedisStore.cache(payload) }
        }
    })
