package com.forsetijudge.core.port.driving.usecase.problem

import com.forsetijudge.core.domain.entity.Problem
import java.util.UUID

interface FindProblemUseCase {
    /**
     * Finds a problem by its ID.
     *
     * @param problemId The ID of the problem to find.
     * @return The problem entity.
     * @throws NotFoundException if the problem is not found.
     */
    fun findById(problemId: UUID): Problem
}
