package io.github.leonfoliveira.forseti.common.application.port.driving

import io.github.leonfoliveira.forseti.common.application.domain.entity.Submission
import io.github.leonfoliveira.forseti.common.application.dto.input.submission.CreateSubmissionInputDTO
import java.util.UUID

interface CreateSubmissionUseCase {
    fun create(
        memberId: UUID,
        inputDTO: CreateSubmissionInputDTO,
    ): Submission
}
