package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Contest
import java.util.UUID

abstract class ContestEvent : BusinessEvent() {
    /**
     * Event triggered when a contest is created.
     *
     * @property contest The contest that was created.
     */
    class Created(
        val contestId: UUID,
    ) : ContestEvent()

    /**
     * Event triggered when a contest is updated.
     *
     * @property contest The contest that was updated.
     */
    class Updated(
        val contestId: UUID,
    ) : ContestEvent()

    /**
     * Event triggered when a contest is deleted.
     *
     * @property contest The contest that was deleted.
     */
    class Deleted(
        val contestId: UUID,
    ) : ContestEvent()
}
