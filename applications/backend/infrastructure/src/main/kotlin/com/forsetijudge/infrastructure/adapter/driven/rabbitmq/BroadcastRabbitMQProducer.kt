package com.forsetijudge.infrastructure.adapter.driven.rabbitmq

import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.infrastructure.adapter.driven.redis.BroadcastEventRedisStore
import com.forsetijudge.infrastructure.adapter.dto.rabbitmq.RabbitMQMessage
import com.forsetijudge.infrastructure.adapter.dto.rabbitmq.body.BroadcastEventFanoutQueueMessageBody
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class BroadcastRabbitMQProducer(
    private val rabbitMQProducer: RabbitMQProducer,
    private val broadCastEventRedisStore: BroadcastEventRedisStore,
    @Value("\${spring.rabbitmq.exchange.websocket-exchange}")
    private val exchange: String,
) : BroadcastProducer {
    override fun produce(event: BroadcastEvent) {
        val message =
            RabbitMQMessage(
                exchange = exchange,
                body =
                    BroadcastEventFanoutQueueMessageBody(
                        room = event.room,
                        name = event.name,
                        data = event.data,
                    ),
            )
        broadCastEventRedisStore.cache(event)
        rabbitMQProducer.produce(message)
    }
}
