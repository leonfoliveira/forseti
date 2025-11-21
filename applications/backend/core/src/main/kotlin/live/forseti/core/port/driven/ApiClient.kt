package live.forseti.core.port.driven

import live.forseti.core.domain.entity.Submission
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
