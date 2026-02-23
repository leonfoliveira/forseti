package com.forsetijudge.infrastructure.adapter.driven.rabbitmq

import com.forsetijudge.core.port.driven.producer.SubmissionQueueProducer
import com.forsetijudge.core.port.driven.producer.payload.SubmissionQueuePayload
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class SubmissionQueueRabbitMQProducer(
    @Value("\${spring.rabbitmq.exchange.submission-exchange}")
    exchange: String,
    @Value("\${spring.rabbitmq.routing-key.submission-routing-key}")
    routingKey: String,
) : RabbitMQProducer<SubmissionQueuePayload>(exchange, routingKey),
    SubmissionQueueProducer
