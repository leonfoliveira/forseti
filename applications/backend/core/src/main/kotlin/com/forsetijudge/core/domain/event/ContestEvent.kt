package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Contest

abstract class ContestEvent : BusinessEvent() {
    /**
     * Event triggered when a contest is created.
     *
     * @property contest The contest that was created.
     */
    class Created(
        val contest: Contest,
    ) : ContestEvent()

    /**
     * Event triggered when a contest is updated.
     *
     * @property contest The contest that was updated.
     */
    class Updated(
        val contest: Contest,
    ) : ContestEvent()

    /**
     * Event triggered when a contest is deleted.
     *
     * @property contest The contest that was deleted.
     */
    class Deleted(
        val contest: Contest,
    ) : ContestEvent()
}
