package com.forsetijudge.infrastructure.adapter.driven.rabbitmq

import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.infrastructure.adapter.driven.redis.BroadcastEventRedisStore
import com.forsetijudge.infrastructure.adapter.dto.rabbitmq.RabbitMQMessage
import com.forsetijudge.infrastructure.adapter.dto.rabbitmq.body.BroadcastEventFanoutQueueMessageBody
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import java.io.Serializable

class BroadcastRabbitMQProducerTest :
    FunSpec({
        val rabbitMQProducer = mockk<RabbitMQProducer>(relaxed = true)
        val broadCastEventRedisStore = mockk<BroadcastEventRedisStore>(relaxed = true)
        val exchange = "test-exchange"

        val sut = BroadcastRabbitMQProducer(rabbitMQProducer, broadCastEventRedisStore, exchange)

        beforeEach {
            clearAllMocks()
        }

        test("should produce message to RabbitMQ") {
            val event =
                BroadcastEvent(
                    room = "/topic/test",
                    name = "TICKET_CREATED",
                    data =
                        mapOf("foo" to "bar") as Serializable,
                )

            sut.produce(event)

            verify { broadCastEventRedisStore.cache(event) }
            val messageSlot = slot<RabbitMQMessage<BroadcastEventFanoutQueueMessageBody>>()
            verify {
                rabbitMQProducer.produce(capture(messageSlot))
            }
            messageSlot.captured.exchange shouldBe exchange
            messageSlot.captured.routingKey shouldBe ""
            messageSlot.captured.body.room shouldBe event.room
            messageSlot.captured.body.name shouldBe event.name
            messageSlot.captured.body.data shouldBe event.data
        }
    })
