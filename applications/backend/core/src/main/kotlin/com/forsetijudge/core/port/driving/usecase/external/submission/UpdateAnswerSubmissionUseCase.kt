package com.forsetijudge.core.port.driving.usecase.external.submission

import com.forsetijudge.core.domain.entity.Submission
import java.util.UUID

interface UpdateAnswerSubmissionUseCase {
    /**
     * Updates the answer of an existing submission.
     *
     * @param command The command containing the submission ID and the new answer.
     * @return The updated submission with its code result.
     */
    fun execute(command: Command): Submission

    /**
     * Command for updating the answer of a submission.
     *
     * @param submissionId The ID of the submission to be updated.
     * @param answer The new answer to be set for the submission.
     */
    data class Command(
        val submissionId: UUID,
        val answer: Submission.Answer,
    )
}
