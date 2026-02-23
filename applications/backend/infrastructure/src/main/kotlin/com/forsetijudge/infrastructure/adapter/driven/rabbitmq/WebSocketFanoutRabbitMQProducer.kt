package com.forsetijudge.infrastructure.adapter.driven.rabbitmq

import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
import com.forsetijudge.core.port.driven.producer.payload.WebSocketFanoutPayload
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class WebSocketFanoutRabbitMQProducer(
    @Value("\${spring.rabbitmq.exchange.websocket-exchange}")
    exchange: String,
) : RabbitMQProducer<WebSocketFanoutPayload>(exchange),
    WebSocketFanoutProducer
