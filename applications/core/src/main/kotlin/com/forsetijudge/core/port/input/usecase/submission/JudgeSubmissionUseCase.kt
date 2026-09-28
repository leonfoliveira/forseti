package com.forsetijudge.core.port.input.usecase.submission

import com.forsetijudge.core.domain.entity.Submission
import java.util.UUID

interface JudgeSubmissionUseCase {
    /**
     * Updates the answer of an existing submission after it has been judged.
     *
     * @param command The command containing the submission ID and the new answer.
     */
    fun execute(command: Command)

    /**
     * Command for updating the answer of a submission after it has been judged.
     *
     * @param submissionId The ID of the submission to be updated.
     * @param answer The new answer to be set for the submission.
     */
    data class Command(
        val submissionId: UUID,
        val answer: Submission.Answer,
    )
}
