package com.forsetijudge.core.port.driven.repository

import com.forsetijudge.core.domain.entity.Clarification
import java.util.UUID

/**
 * Accessor for persistence operations related to Clarification entity
 */
interface ClarificationRepository : BaseRepository<Clarification> {
    fun findEntityById(id: UUID): Clarification?
}
