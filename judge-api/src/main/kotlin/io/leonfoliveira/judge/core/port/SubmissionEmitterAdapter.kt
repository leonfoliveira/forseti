package io.leonfoliveira.judge.core.port

import io.leonfoliveira.judge.core.entity.Submission

interface SubmissionEmitterAdapter {
    fun emit(submission: Submission)
}
