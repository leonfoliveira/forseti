package io.github.leonfoliveira.judge.common.port

import io.github.leonfoliveira.judge.common.domain.entity.Submission

interface SubmissionQueueAdapter {
    fun enqueue(submission: Submission)
}
