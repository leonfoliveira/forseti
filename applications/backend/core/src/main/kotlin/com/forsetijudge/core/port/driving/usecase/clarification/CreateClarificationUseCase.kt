package com.forsetijudge.core.port.driving.usecase.clarification

import com.forsetijudge.core.domain.entity.Clarification
import com.forsetijudge.core.port.dto.input.clarification.CreateClarificationInputDTO
import java.util.UUID

interface CreateClarificationUseCase {
    /**
     * Creates a new clarification for a contest.
     *
     * @param contestId The ID of the contest where the clarification is being created.
     * @param memberId The ID of the member creating the clarification.
     * @param input The input data for creating the clarification.
     * @return The created clarification entity.
     */
    fun create(
        contestId: UUID,
        memberId: UUID,
        input: CreateClarificationInputDTO,
    ): Clarification
}
