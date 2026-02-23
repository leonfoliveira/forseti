package com.forsetijudge.core.port.driven.producer

import com.forsetijudge.core.port.driven.producer.payload.WebSocketFanoutPayload

/**
 * A specialized [QueueProducer] for producing messages to a WebSocket fanout queue.
 *
 * This producer is used to send real-time updates to clients connected via WebSocket. The payload contains the necessary information to identify the target clients and the message content.
 */
interface WebSocketFanoutProducer : QueueProducer<WebSocketFanoutPayload>
