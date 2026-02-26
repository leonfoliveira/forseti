package com.forsetijudge.core.port.driving.usecase.external.submission

import com.forsetijudge.core.domain.entity.Submission
import java.util.UUID

interface ResetSubmissionUseCase {
    /**
     * Reruns a submission by its ID, returning the updated submission details along with the code.
     *
     * @param command The command containing the submission ID to be rerun.
     * @return The result of the rerun operation, including the submission details and code.
     */
    fun execute(command: Command): Submission

    /**
     * Command for rerunning a submission.
     *
     * @param submissionId The ID of the submission to be rerun.
     */
    data class Command(
        val submissionId: UUID,
    )
}
