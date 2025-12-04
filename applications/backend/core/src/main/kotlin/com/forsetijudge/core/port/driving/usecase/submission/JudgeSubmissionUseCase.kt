package com.forsetijudge.core.port.driving.usecase.submission

import java.util.UUID

interface JudgeSubmissionUseCase {
    /**
     * Judges a submission in a contest by evaluating it against test cases.
     *
     * @param contestId The ID of the contest containing the submission.
     * @param submissionId The ID of the submission to be judged.
     */
    fun judge(
        contestId: UUID,
        submissionId: UUID,
    )
}
