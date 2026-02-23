package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Submission

abstract class SubmissionEvent(
    val submission: Submission,
) : BusinessEvent<Submission>(submission) {
    /**
     * Event triggered when a new submission is created
     *
     * @param submission the created submission
     */
    class Created(
        submission: Submission,
    ) : SubmissionEvent(submission)

    /**
     * Event triggered when a submission is reset
     *
     * @param submission the reset submission
     */
    class Reset(
        submission: Submission,
    ) : SubmissionEvent(submission)

    /**
     * Event triggered when a submission is updated
     *
     * @param submission the updated submission
     */
    class Updated(
        submission: Submission,
    ) : SubmissionEvent(submission)
}
