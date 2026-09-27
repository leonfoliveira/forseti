package com.forsetijudge.core.service.submission

import com.forsetijudge.core.port.dto.response.submission.SubmissionWithCodeAndExecutionsResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.submission.ResubmitSubmissionUseCase

class ResubmitSubmissionService : ResubmitSubmissionUseCase {
    /**
     * Resubmits a submission by its ID, resting its status and returning the updated details along with the code.
     *
     * @param command The command containing the submission ID to be rerun.
     * @return The result of the resubmission operation, including the submission details and code.
     */
    override fun execute(command: ResubmitSubmissionUseCase.Command): SubmissionWithCodeAndExecutionsResponseBodyDTO {
        TODO("Not yet implemented")
    }
}
