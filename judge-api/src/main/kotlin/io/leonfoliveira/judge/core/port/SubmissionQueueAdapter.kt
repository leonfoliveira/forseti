package io.leonfoliveira.judge.core.port

import io.leonfoliveira.judge.core.domain.entity.Submission

interface SubmissionQueueAdapter {
    fun enqueue(submission: Submission)
}
