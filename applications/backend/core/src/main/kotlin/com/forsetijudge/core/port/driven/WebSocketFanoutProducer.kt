package com.forsetijudge.core.port.driven

import java.io.Serializable

interface WebSocketFanoutProducer {
    /**
     * Produces a message to be sent to all instances for websocket fanout.
     *
     * @param destination The destination to send the message to
     * @param payload The payload of the message
     */
    fun <T : Serializable> produce(
        destination: String,
        payload: T,
    )
}
