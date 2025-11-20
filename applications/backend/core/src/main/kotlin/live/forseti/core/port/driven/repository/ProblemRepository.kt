package live.forseti.core.port.driven.repository

import live.forseti.core.domain.entity.Problem
import java.util.UUID

/**
 * Accessor for persistence operations related to Problem entity
 */
interface ProblemRepository : BaseRepository<Problem> {
    fun findEntityById(id: UUID): Problem?
}
