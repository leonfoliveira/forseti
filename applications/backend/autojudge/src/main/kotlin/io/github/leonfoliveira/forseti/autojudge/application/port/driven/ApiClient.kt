package io.github.leonfoliveira.forseti.autojudge.application.port.driven

import io.github.leonfoliveira.forseti.common.application.domain.entity.Submission
import java.util.UUID

interface ApiClient {
    /**
     * Request to update submission answer.
     *
     * @param contestId The ID of the contest.
     * @param submissionId The ID of the submission.
     * @param answer The new answer for the submission.
     */
    fun updateSubmissionAnswer(
        contestId: UUID,
        submissionId: UUID,
        answer: Submission.Answer,
    )
}
