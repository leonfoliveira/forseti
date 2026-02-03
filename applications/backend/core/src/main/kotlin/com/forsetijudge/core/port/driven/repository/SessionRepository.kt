package com.forsetijudge.core.port.driven.repository

import com.forsetijudge.core.domain.entity.Session
import java.util.UUID

/**
 * Accessor for persistence operations related to Session entity
 */
interface SessionRepository : BaseRepository<Session> {
    fun findEntityById(id: UUID): Session?

    fun findAllByMemberId(memberId: UUID): List<Session>
}
