package com.forsetijudge.infrastructure.adapter.dto.message

import com.github.f4b6a3.uuid.UuidCreator
import io.opentelemetry.api.trace.Span
import java.io.Serializable
import java.util.UUID

/**
 * A generic RabbitMQ message wrapper that includes a unique identifier and an optional trace ID for tracking.
 *
 * @param TPayload The type of the payload contained in the message, which must be serializable.
 * @property id A unique identifier for the message, generated as a random UUID by default.
 * @property traceId An optional trace ID for tracking purposes. Default value is retrieved from the current span.
 * @property payload The actual payload of the message.
 */
data class RabbitMQMessage<TPayload : Serializable>(
    val id: UUID = UuidCreator.getTimeOrderedEpoch(),
    val traceId: String = Span.current().spanContext.traceId,
    val payload: TPayload,
) : Serializable
