package com.forsetijudge.core.port.output.cache

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
     * Evicts the session with the given ID from the cache. If no session with the given ID exists, this method does nothing.
     */
    fun evict(session: SessionResponseBodyDTO)
}
