package io.leonfoliveira.judge.core.port

import io.leonfoliveira.judge.core.domain.entity.Submission

interface SubmissionEmitterAdapter {
    fun emit(submission: Submission)
}
