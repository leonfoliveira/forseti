package io.github.leonfoliveira.forseti.common.application.port.driven.repository

import io.github.leonfoliveira.forseti.common.application.domain.entity.Problem
import java.util.UUID

/**
 * Accessor for persistence operations related to Problem entity
 */
interface ProblemRepository : BaseRepository<Problem> {
    fun findEntityById(id: UUID): Problem?
}
