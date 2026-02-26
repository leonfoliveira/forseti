package com.forsetijudge.core.port.driven.queue

import java.io.Serializable

interface QueueProducer<TPayload : Serializable> {
    /**
     * Produces a message with the given [payload] to the queue.
     *
     * The [payload] must be serializable, as it will be transmitted over the network or stored in a queue. The implementation of this method will handle the specifics of how the message is produced and sent to the appropriate queue.
     *
     * @param payload The data to be sent as a message to the queue. It must be of type [TPayload] and must be serializable.
     */
    fun produce(payload: TPayload)
}
