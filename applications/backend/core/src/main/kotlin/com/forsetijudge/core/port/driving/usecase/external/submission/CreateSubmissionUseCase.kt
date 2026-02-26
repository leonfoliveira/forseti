package com.forsetijudge.core.port.driving.usecase.external.submission

import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.dto.command.AttachmentCommandDTO
import jakarta.validation.Valid
import java.util.UUID

interface CreateSubmissionUseCase {
    /**
     * Creates a new submission for a member in a contest.
     *
     * @param command The command containing the details of the submission to be created.
     * @return The result of the submission creation, including the submission details and code.
     */
    fun execute(
        @Valid command: Command,
    ): Submission

    /**
     * Command for creating a new submission.
     *
     * @param problemId The ID of the problem for which the submission is being made.
     * @param language The programming language used in the submission.
     * @param code The code of the submission, provided as an attachment input DTO.
     */
    data class Command(
        val problemId: UUID,
        val language: Submission.Language,
        @field:Valid
        val code: AttachmentCommandDTO,
    )
}
