package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Contest

abstract class ContestEvent(
    val contest: Contest,
) : BusinessEvent<Contest>(contest) {
    /**
     * Event triggered when a contest is created.
     *
     * @property contest The contest that was created.
     */
    class Created(
        contest: Contest,
    ) : ContestEvent(contest)

    /**
     * Event triggered when a contest is updated.
     *
     * @property contest The contest that was updated.
     */
    class Updated(
        contest: Contest,
    ) : ContestEvent(contest)

    /**
     * Event triggered when a contest is deleted.
     *
     * @property contest The contest that was deleted.
     */
    class Deleted(
        contest: Contest,
    ) : ContestEvent(contest)
}
