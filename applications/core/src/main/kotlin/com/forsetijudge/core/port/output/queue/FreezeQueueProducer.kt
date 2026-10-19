package com.forsetijudge.core.port.output.queue

import java.time.OffsetDateTime

interface FreezeQueueProducer {
    /**
     * Produces a message to be sent to the freeze queue at a specified time.
     *
     * @param message The message to be sent to the freeze queue.
     */
    fun produce(
        message: Message,
        at: OffsetDateTime,
    )

    /**
     * Cancels a scheduled freeze event for a given contest.
     *
     * @param contestId The ID of the contest for which the freeze event is being canceled.
     */
    fun cancel(contestId: String)

    /**
     * Represents a message to be sent to the freeze queue.
     *
     * @param contestId The ID of the contest for which the freeze event is being produced.
     */
    data class Message(
        val contestId: String,
    )
}
