package com.forsetijudge.core.application.helper.session

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.port.output.cache.SessionCache
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Service

@Service
class SessionDeleter(
    private val sessionCache: SessionCache,
) {
    private val logger = SafeLogger(this::class)

    /**
     * Delete the session associated with a specific member.
     *
     * @param member The member whose sessions are to be deleted.
     */
    fun deleteByMember(member: Member) {
        logger.info("Deleting session for member with id: ${member.id}")

        sessionCache.evictByMemberId(memberId = member.id)

        logger.info("Session deleted successfully or no session found")
    }
}
