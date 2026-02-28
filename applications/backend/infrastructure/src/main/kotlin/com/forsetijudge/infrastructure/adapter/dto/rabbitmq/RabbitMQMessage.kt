package com.forsetijudge.infrastructure.adapter.dto.rabbitmq

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.model.ExecutionContext
import java.io.Serializable
import java.util.UUID

/**
 * A generic RabbitMQ message wrapper that includes a unique identifier and an optional trace ID for tracking.
 *
 * @param TBody The type of the payload contained in the message, which must be serializable.
 * @property id A unique identifier for the message, generated as a random UUID by default.
 * @property exchange The RabbitMQ exchange to which the message will be sent.
 * @property routingKey An optional routing key for the message, which can be used by RabbitMQ to route the message to the appropriate queue. Default value is an empty string.
 * @property traceId An optional trace ID for tracking purposes. Default value is retrieved from the current span.
 * @property body The actual payload of the message, which must be serializable.
 * @property priority An optional priority level for the message, which can be used by RabbitMQ to determine the order of message processing. Default value is null.
 */
data class RabbitMQMessage<TBody : Serializable>(
    val id: UUID = IdGenerator.getUUID(),
    val exchange: String,
    val routingKey: String = "",
    val traceId: String = ExecutionContext.get().traceId,
    val body: TBody,
    val priority: Int? = null,
) : Serializable
