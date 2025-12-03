package com.forsetijudge.core.port.driven

import com.forsetijudge.core.port.dto.request.UpdateSubmissionAnswerRequestDTO
import java.util.UUID

interface ApiClient {
    /**
     * Request to update submission answer.
     *
     * @param contestId The ID of the contest.
     * @param submissionId The ID of the submission.
     * @param body The new answer for the submission.
     */
    fun updateSubmissionAnswer(
        contestId: UUID,
        submissionId: UUID,
        body: UpdateSubmissionAnswerRequestDTO,
    )
}
