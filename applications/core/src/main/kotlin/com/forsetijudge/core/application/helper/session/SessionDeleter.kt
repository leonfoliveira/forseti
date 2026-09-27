package com.forsetijudge.core.application.helper.session

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.port.output.cache.SessionCache
import com.forsetijudge.core.port.output.repository.SessionRepository
import com.forsetijudge.core.util.SafeLogger
import java.time.OffsetDateTime
import org.springframework.stereotype.Service

@Service
class SessionDeleter(
    private val sessionRepository: SessionRepository,
    private val sessionCache: SessionCache,
) {
    private val logger = SafeLogger(this::class)

    /**
     * Deletes all sessions associated with a specific member.
     *
     * @param member The member whose sessions are to be deleted.
     */
    fun deleteAllByMember(member: Member) {
        logger.info("Deleting all sessions for member with id: ${member.id}")

        val now = OffsetDateTime.now()

        val sessions =
            sessionRepository.findAllByMemberIdAndExpiresAtGreaterThan(
                member.id,
                now,
            )

        sessions.forEach { it.deletedAt = now }
        sessionRepository.saveAll(sessions)
        sessionCache.evictByMemberId(memberId = member.id)

        logger.info("All sessions deleted successfully")
    }
}
