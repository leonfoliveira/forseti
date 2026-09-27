package com.forsetijudge.core.service.submission

import com.forsetijudge.core.port.dto.response.submission.SubmissionWithCodeAndExecutionsResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.submission.UpdateAnswerSubmissionUseCase

class UpdateAnswerSubmissionService : UpdateAnswerSubmissionUseCase {
    /**
     * Updates the answer of an existing submission.
     *
     * @param command The command containing the submission ID and the new answer.
     * @return The updated submission with its code result.
     */
    override fun execute(command: UpdateAnswerSubmissionUseCase.Command): SubmissionWithCodeAndExecutionsResponseBodyDTO {
        TODO("Not yet implemented")
    }
}
