package com.forsetijudge.core.domain.event

import java.util.UUID

interface ContestEvent : BusinessEvent {
    /**
     * Event triggered when a contest is created.
     *
     * @property contestId The contest that was created.
     */
    data class Created(
        val contestId: UUID,
    ) : ContestEvent

    /**
     * Event triggered when a contest is updated.
     *
     * @property contestId The contest that was updated.
     */
    data class Updated(
        val contestId: UUID,
    ) : ContestEvent

    /**
     * Event triggered when a contest is deleted.
     *
     * @property contestId The contest that was deleted.
     */
    data class Deleted(
        val contestId: UUID,
    ) : ContestEvent
}
