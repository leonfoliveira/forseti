package io.github.leonfoliveira.forseti.common.application.port.driving

import io.github.leonfoliveira.forseti.common.application.domain.entity.Clarification
import io.github.leonfoliveira.forseti.common.application.dto.input.clarification.CreateClarificationInputDTO
import java.util.UUID

interface CreateClarificationUseCase {
    fun create(
        contestId: UUID,
        memberId: UUID,
        input: CreateClarificationInputDTO,
    ): Clarification
}
