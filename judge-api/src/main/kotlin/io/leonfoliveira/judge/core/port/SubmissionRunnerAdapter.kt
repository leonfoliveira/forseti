package io.leonfoliveira.judge.core.port

import io.leonfoliveira.judge.core.domain.entity.Submission

interface SubmissionRunnerAdapter {
    fun run(submission: Submission): Submission.Answer
}
