package io.github.leonfoliveira.judge.core.port

import io.github.leonfoliveira.judge.core.domain.entity.Submission

interface SubmissionQueueAdapter {
    fun enqueue(submission: Submission)
}
