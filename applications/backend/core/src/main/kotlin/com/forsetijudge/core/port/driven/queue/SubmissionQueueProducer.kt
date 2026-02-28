package com.forsetijudge.core.port.driven.queue

import com.forsetijudge.core.domain.entity.Submission

interface SubmissionQueueProducer {
    fun produce(submission: Submission)
}
