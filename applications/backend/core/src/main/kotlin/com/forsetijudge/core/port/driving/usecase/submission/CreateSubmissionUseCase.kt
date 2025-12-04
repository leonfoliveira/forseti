package com.forsetijudge.core.port.driving.usecase.submission

import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.dto.input.submission.CreateSubmissionInputDTO
import jakarta.validation.Valid
import java.util.UUID

interface CreateSubmissionUseCase {
    /**
     * Creates a new submission for a member in a contest.
     *
     * @param memberId The ID of the member creating the submission.
     * @param inputDTO The data required to create the submission.
     * @return The created submission entity.
     */
    fun create(
        memberId: UUID,
        @Valid inputDTO: CreateSubmissionInputDTO,
    ): Submission
}
