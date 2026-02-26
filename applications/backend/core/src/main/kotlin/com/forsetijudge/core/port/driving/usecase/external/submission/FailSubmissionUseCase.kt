package com.forsetijudge.core.port.driving.usecase.external.submission

import java.util.UUID

interface FailSubmissionUseCase {
    /**
     * Marks a submission as failed.
     */
    fun execute(command: Command)

    /**
     * Command for failing a submission.
     *
     * @param submissionId The ID of the submission to be marked as failed.
     */
    data class Command(
        val submissionId: UUID,
    )
}
