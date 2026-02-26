package com.forsetijudge.infrastructure.adapter.driven.rabbitmq

import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.queue.QueueProducer
import com.forsetijudge.infrastructure.adapter.driven.redis.BroadcastEventRedisStore
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class BroadcastRabbitMQProducer(
    @Value("\${spring.rabbitmq.exchange.websocket-exchange}")
    exchange: String,
    val broadCastEventRedisStore: BroadcastEventRedisStore,
) : RabbitMQProducer<BroadcastEvent>(exchange),
    QueueProducer<BroadcastEvent>,
    BroadcastProducer {
    override fun produce(payload: BroadcastEvent) {
        broadCastEventRedisStore.save(payload)
        super.produce(payload)
    }
}
