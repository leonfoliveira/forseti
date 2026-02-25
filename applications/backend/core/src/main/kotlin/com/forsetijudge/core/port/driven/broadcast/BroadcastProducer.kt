package com.forsetijudge.core.port.driven.broadcast

import com.forsetijudge.core.port.driven.broadcast.payload.BroadcastPayload

/**
 * Interface for producing broadcast messages.
 *
 * This interface defines a contract for producing broadcast messages with a given payload.
 */
interface BroadcastProducer {
    /**
     * Produces a broadcast message with the specified [payload].
     *
     * @param payload The data to be sent as a broadcast message. It must be of type [BroadcastPayload].
     */
    fun produce(payload: BroadcastPayload)
}
