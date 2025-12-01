package live.forseti.core.port.driven

import live.forseti.core.port.dto.request.UpdateSubmissionAnswerRequestDTO
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
