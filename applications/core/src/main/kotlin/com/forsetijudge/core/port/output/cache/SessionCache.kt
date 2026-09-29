package com.forsetijudge.core.port.output.cache

import com.forsetijudge.core.domain.model.Session
import java.util.UUID

interface SessionCache {
    /**
     * Caches the given session. If a session with the same ID already exists, it will be replaced.
     */
    fun cache(session: Session)

    /**
     * Retrieves the session with the given ID from the cache. Returns null if no session with the given ID exists.
     */
    fun get(id: UUID): Session?

    /**
     * Evicts the given session from the cache. If the session does not exist in the cache, this method does nothing.
     */
    fun evict(session: Session)

    /**
     * Evicts the session with the given member ID from the cache. If no session with the given member ID exists, this method does nothing.
     */
    fun evictByMemberId(memberId: UUID)
}
