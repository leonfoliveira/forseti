package com.forsetijudge.infrastructure.adapter.dto.message.payload

import java.io.Serializable

/**
 * Payload for websocket broadcast messages sent via RabbitMQ
 *
 * @param destination The destination to broadcast the message to
 * @param payload The payload of the message
 */
data class WebSocketFanoutMessagePayload(
    val destination: String,
    val payload: Serializable,
) : Serializable

data class WebSocketFanoutMessageBatchPayload(
    val destination: String,
    val payload: List<Serializable>,
) : Serializable
