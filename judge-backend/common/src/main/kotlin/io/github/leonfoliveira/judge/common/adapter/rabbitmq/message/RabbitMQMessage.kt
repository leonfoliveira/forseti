package io.github.leonfoliveira.judge.common.adapter.rabbitmq.message

import org.slf4j.MDC
import java.io.Serializable
import java.util.UUID

data class RabbitMQMessage<TPayload : Serializable>(
    val id: UUID = UUID.randomUUID(),
    val traceId: String? = MDC.get("traceId"),
    val payload: TPayload,
) : Serializable
