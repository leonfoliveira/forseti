package com.forsetijudge.core.port.driven.cache

import com.forsetijudge.core.port.dto.response.session.SessionResponseBodyDTO
import java.util.UUID

interface SessionCache {
    /**
     * Caches the given session. If a session with the same ID already exists, it will be replaced.
     */
    fun cache(session: SessionResponseBodyDTO)

    /**
     * Retrieves the session with the given ID from the cache. Returns null if no session with the given ID exists.
     */
    fun get(id: UUID): SessionResponseBodyDTO?

    /**
     * Deletes the given session from the cache. If the session does not exist, this method does nothing.
     */
    fun delete(sessionId: UUID)
}
