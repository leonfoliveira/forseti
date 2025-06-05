package io.leonfoliveira.judge.core.port

import io.leonfoliveira.judge.core.domain.entity.Submission

interface SubmissionEmitterAdapter {
    fun emitForContest(submission: Submission)

    fun emitForMember(submission: Submission)

    fun emitFail(submission: Submission)
}
