package com.forsetijudge.core.port.output.notification

import com.forsetijudge.core.domain.entity.Submission

interface BusinessEventProducer {
    /**
     * Produce a new submission event.
     *
     * @param submission The submission for which the event is produced.
     */
    fun produceNewSubmissionEvent(submission: Submission)
}
