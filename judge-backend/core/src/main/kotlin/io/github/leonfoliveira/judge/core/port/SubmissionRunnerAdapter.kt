package io.github.leonfoliveira.judge.core.port

import io.github.leonfoliveira.judge.core.domain.entity.Submission

interface SubmissionRunnerAdapter {
    fun run(submission: Submission): Submission.Answer
}
