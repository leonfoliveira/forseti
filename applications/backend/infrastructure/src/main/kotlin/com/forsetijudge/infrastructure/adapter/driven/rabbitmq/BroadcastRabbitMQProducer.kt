package com.forsetijudge.infrastructure.adapter.driven.rabbitmq

import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.payload.BroadcastPayload
import com.forsetijudge.core.port.driven.queue.QueueProducer
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class BroadcastRabbitMQProducer(
    @Value("\${spring.rabbitmq.exchange.websocket-exchange}")
    exchange: String,
) : RabbitMQProducer<BroadcastPayload>(exchange),
    QueueProducer<BroadcastPayload>,
    BroadcastProducer
