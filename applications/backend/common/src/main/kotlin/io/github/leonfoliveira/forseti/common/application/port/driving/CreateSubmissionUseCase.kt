package io.github.leonfoliveira.forseti.common.application.port.driving

import io.github.leonfoliveira.forseti.common.application.domain.entity.Submission
import io.github.leonfoliveira.forseti.common.application.dto.input.submission.CreateSubmissionInputDTO
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
        inputDTO: CreateSubmissionInputDTO,
    ): Submission
}
