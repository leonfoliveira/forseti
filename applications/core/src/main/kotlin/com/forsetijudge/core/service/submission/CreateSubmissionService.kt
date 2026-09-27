package com.forsetijudge.core.service.submission

import com.forsetijudge.core.port.dto.response.submission.SubmissionWithCodeResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.submission.CreateSubmissionUseCase

class CreateSubmissionService : CreateSubmissionUseCase {
    /**
     * Creates a new submission for a member in a contest.
     *
     * @param command The command containing the details of the submission to be created.
     * @return The result of the submission creation, including the submission details and code.
     */
    override fun execute(command: CreateSubmissionUseCase.Command): SubmissionWithCodeResponseBodyDTO {
        TODO("Not yet implemented")
    }
}
