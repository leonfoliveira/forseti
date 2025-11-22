package live.forseti.core.port.driven.repository

import live.forseti.core.domain.entity.Clarification
import java.util.UUID

/**
 * Accessor for persistence operations related to Clarification entity
 */
interface ClarificationRepository : BaseRepository<Clarification> {
    fun findEntityById(id: UUID): Clarification?
}
