package com.forsetijudge.core.port.input.usecase.submission

import com.forsetijudge.core.port.dto.response.submission.SubmissionWithCodeAndExecutionsResponseBodyDTO
import java.util.UUID

interface ResubmitSubmissionUseCase {
    /**
     * Resubmits a submission by its ID, resting its status and returning the updated details along with the code.
     *
     * @param command The command containing the submission ID to be rerun.
     * @return The result of the resubmission operation, including the submission details and code.
     */
    fun execute(command: Command): SubmissionWithCodeAndExecutionsResponseBodyDTO

    /**
     * Command for submitting a submission.
     *
     * @param contestId The ID of the contest to which the submission belongs.
     * @param submissionId The ID of the submission to be rerun.
     */
    data class Command(
        val contestId: UUID,
        val submissionId: UUID,
    )
}
