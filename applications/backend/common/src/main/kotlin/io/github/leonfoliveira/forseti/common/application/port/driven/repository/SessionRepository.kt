package io.github.leonfoliveira.forseti.common.application.port.driven.repository

import io.github.leonfoliveira.forseti.common.application.domain.entity.Session
import java.util.UUID

/**
 * Accessor for persistence operations related to Session entity
 */
interface SessionRepository : BaseRepository<Session> {
    fun findEntityById(id: UUID): Session?
}
