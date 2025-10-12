package io.github.leonfoliveira.forseti.common.port

import io.github.leonfoliveira.forseti.common.domain.entity.Submission

interface SubmissionQueueProducer {
    fun produce(submission: Submission)
}
