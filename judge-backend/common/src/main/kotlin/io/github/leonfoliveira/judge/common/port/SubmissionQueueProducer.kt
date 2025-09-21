package io.github.leonfoliveira.judge.common.port

import io.github.leonfoliveira.judge.common.domain.entity.Submission

interface SubmissionQueueProducer {
    fun produce(submission: Submission)
}
