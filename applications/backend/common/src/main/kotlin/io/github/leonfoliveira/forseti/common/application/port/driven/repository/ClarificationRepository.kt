package io.github.leonfoliveira.forseti.common.application.port.driven.repository

import io.github.leonfoliveira.forseti.common.application.domain.entity.Clarification
import java.util.UUID

/**
 * Accessor for persistence operations related to Clarification entity
 */
interface ClarificationRepository : BaseRepository<Clarification> {
    fun findEntityById(id: UUID): Clarification?
}
