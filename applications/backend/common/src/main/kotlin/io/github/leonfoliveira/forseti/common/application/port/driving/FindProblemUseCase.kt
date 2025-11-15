package io.github.leonfoliveira.forseti.common.application.port.driving

import io.github.leonfoliveira.forseti.common.application.domain.entity.Problem
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
