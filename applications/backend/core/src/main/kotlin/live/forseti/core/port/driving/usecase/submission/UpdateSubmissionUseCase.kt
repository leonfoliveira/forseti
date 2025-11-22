package live.forseti.core.port.driving.usecase.submission

import live.forseti.core.domain.entity.Submission
import java.util.UUID

interface UpdateSubmissionUseCase {
    /**
     * Marks a submission as failed.
     *
     * @param submissionId The ID of the submission to mark as failed.
     * @return The updated submission entity.
     */
    fun fail(submissionId: UUID): Submission

    /**
     * Reruns a submission for evaluation.
     *
     * @param id The ID of the submission to rerun.
     * @return The updated submission entity.
     */
    fun rerun(id: UUID): Submission

    /**
     * Updates the answer/result of a submission.
     *
     * @param submissionId The ID of the submission to update.
     * @param answer The new answer to set for the submission.
     * @param force Whether to force the update even if the submission is already finalized.
     * @return The updated submission entity.
     */
    fun updateAnswer(
        submissionId: UUID,
        answer: Submission.Answer,
        force: Boolean = false,
    ): Submission
}
