package io.leonfoliveira.judge.core.port

import io.leonfoliveira.judge.core.entity.Submission

interface SubmissionRunnerAdapter {
    fun run(submission: Submission): Submission.Status
}
