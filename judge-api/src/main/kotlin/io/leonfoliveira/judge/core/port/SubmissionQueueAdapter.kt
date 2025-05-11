package io.leonfoliveira.judge.core.port

import io.leonfoliveira.judge.core.entity.Submission

interface SubmissionQueueAdapter {
    fun enqueue(submission: Submission)
}
