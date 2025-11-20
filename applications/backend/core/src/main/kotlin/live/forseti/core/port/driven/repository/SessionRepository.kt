package live.forseti.core.port.driven.repository

import live.forseti.core.domain.entity.Session
import java.util.UUID

/**
 * Accessor for persistence operations related to Session entity
 */
interface SessionRepository : BaseRepository<Session> {
    fun findEntityById(id: UUID): Session?
}
