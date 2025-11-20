package live.forseti.core.port.driven.repository

import live.forseti.core.domain.entity.Contest
import java.util.UUID

/**
 * Accessor for persistence operations related to Contest entity
 */
interface ContestRepository : BaseRepository<Contest> {
    fun findEntityById(id: UUID): Contest?

    fun findBySlug(slug: String): Contest?
}
