package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Submission

abstract class SubmissionEvent : BusinessEvent() {
    /**
     * Event triggered when a new submission is created
     *
     * @param submission the created submission
     */
    class Created(
        val submission: Submission,
    ) : SubmissionEvent()

    /**
     * Event triggered when a submission is reset
     *
     * @param submission the reset submission
     */
    class Reset(
        val submission: Submission,
    ) : SubmissionEvent()

    /**
     * Event triggered when a submission is updated
     *
     * @param submission the updated submission
     */
    class Updated(
        val submission: Submission,
    ) : SubmissionEvent()
}
