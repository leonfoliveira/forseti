package io.github.leonfoliveira.forseti.common.adapter.rabbitmq.message

import org.slf4j.MDC
import java.io.Serializable
import java.util.UUID

/**
 * A generic RabbitMQ message wrapper that includes a unique identifier and an optional trace ID for tracking.
 *
 * @param TPayload The type of the payload contained in the message, which must be serializable.
 * @property id A unique identifier for the message, generated as a random UUID by default.
 * @property traceId An optional trace ID for tracking purposes. Default value is retrieved from the MDC.
 * @property payload The actual payload of the message.
 */
data class RabbitMQMessage<TPayload : Serializable>(
    val id: UUID = UUID.randomUUID(),
    val traceId: String? = MDC.get("traceId"),
    val payload: TPayload,
) : Serializable
