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
     * Retrieves the session associated with the given member ID from the cache. Returns null if no session for the given member ID exists.
     */
    fun getByMemberId(memberId: UUID): SessionResponseBodyDTO?

    /**
     * Evicts the session with the given ID from the cache. If no session with the given ID exists, this method does nothing.
     */
    fun evict(session: SessionResponseBodyDTO)

    /**
     * Evicts all sessions in the cache that are associated with the given collection of sessions.
     */
    fun evictAll(sessions: Collection<SessionResponseBodyDTO>)
}
