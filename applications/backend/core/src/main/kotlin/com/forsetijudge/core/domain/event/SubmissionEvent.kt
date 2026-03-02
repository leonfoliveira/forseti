package com.forsetijudge.core.domain.event

import java.util.UUID

abstract class SubmissionEvent : BusinessEvent() {
    /**
     * Event triggered when a new submission is created
     *
     * @param submission the created submission
     */
    class Created(
        val submissionId: UUID,
    ) : SubmissionEvent()

    /**
     * Event triggered when a submission is reset
     *
     * @param submission the reset submission
     */
    class Reset(
        val submissionId: UUID,
    ) : SubmissionEvent()

    /**
     * Event triggered when a submission is updated
     *
     * @param submission the updated submission
     */
    class Updated(
        val submissionId: UUID,
    ) : SubmissionEvent()
}
