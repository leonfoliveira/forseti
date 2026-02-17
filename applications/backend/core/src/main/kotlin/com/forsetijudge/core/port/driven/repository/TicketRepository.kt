package com.forsetijudge.core.port.driven.repository

import com.forsetijudge.core.domain.entity.Ticket
import java.util.UUID

/**
 * Accessor for persistence operations related to Ticket entity
 */
interface TicketRepository : BaseRepository<Ticket<*>> {
    fun findEntityById(id: UUID): Ticket<*>?
}
