package io.github.leonfoliveira.judge.core.port

import io.github.leonfoliveira.judge.core.domain.entity.Submission

interface SubmissionEmitterAdapter {
    fun emitForContest(submission: Submission)
}
