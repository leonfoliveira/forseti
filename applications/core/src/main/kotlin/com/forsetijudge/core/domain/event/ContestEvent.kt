package com.forsetijudge.core.domain.event

import java.time.OffsetDateTime
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

    /**
     * Event triggered when a contest is frozen.
     *
     * @property contestId The contest that was frozen.
     */
    data class Frozen(
        val contestId: UUID,
    ) : ContestEvent

    /**
     * Event triggered when a contest is unfrozen.
     *
     * @property contestId The contest that was unfrozen.
     * @property frozenAt The time when the contest was unfrozen.
     */
    data class Unfrozen(
        val contestId: UUID,
        val frozenAt: OffsetDateTime,
    ) : ContestEvent
}
