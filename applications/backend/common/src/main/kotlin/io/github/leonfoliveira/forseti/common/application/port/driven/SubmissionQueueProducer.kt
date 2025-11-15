package io.github.leonfoliveira.forseti.common.application.port.driven

import io.github.leonfoliveira.forseti.common.application.domain.entity.Submission

interface SubmissionQueueProducer {
    /**
     * Enqueue a submission to be judged by the autojudge service
     */
    fun produce(submission: Submission)
}
