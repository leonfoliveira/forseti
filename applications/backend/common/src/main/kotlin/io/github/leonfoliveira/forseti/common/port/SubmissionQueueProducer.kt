package io.github.leonfoliveira.forseti.common.port

import io.github.leonfoliveira.forseti.common.domain.entity.Submission

interface SubmissionQueueProducer {
    /**
     * Enqueue a submission to be judged by the autojudge service
     */
    fun produce(submission: Submission)
}
