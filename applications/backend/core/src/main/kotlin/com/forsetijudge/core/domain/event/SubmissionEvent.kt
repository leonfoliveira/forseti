package com.forsetijudge.core.domain.event

import java.util.UUID

interface SubmissionEvent : BusinessEvent {
    /**
     * Event triggered when a new submission is created
     *
     * @param submissionId the created submission
     */
    data class Created(
        val submissionId: UUID,
    ) : SubmissionEvent

    /**
     * Event triggered when a submission is reset
     *
     * @param submissionId the reset submission
     */
    data class Reset(
        val submissionId: UUID,
    ) : SubmissionEvent

    /**
     * Event triggered when a submission is updated
     *
     * @param submissionId the updated submission
     */
    data class Updated(
        val submissionId: UUID,
    ) : SubmissionEvent
}
