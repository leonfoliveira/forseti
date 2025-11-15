package io.github.leonfoliveira.forseti.common.application.port.driving

import io.github.leonfoliveira.forseti.common.application.domain.entity.Problem
import java.util.UUID

interface FindProblemUseCase {
    fun findById(problemId: UUID): Problem
}
