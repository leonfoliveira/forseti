package com.forsetijudge.core.application.helper.session

import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.cache.SessionCache
import com.forsetijudge.core.port.driven.repository.SessionRepository
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import org.springframework.stereotype.Service

@Service
class SessionDeleter(
    private val sessionRepository: SessionRepository,
    private val sessionCache: SessionCache,
) {
    private val logger = SafeLogger(this::class)

    fun deleteAllByMember(member: Member) {
        logger.info("Deleting all sessions for member with id: ${member.id}")

        val sessions =
            sessionRepository.findAllByMemberIdAndExpiresAtGreaterThan(
                member.id,
                ExecutionContext.get().startedAt,
            )

        sessions.forEach { it.deletedAt = ExecutionContext.get().startedAt }
        sessionRepository.saveAll(sessions)
        sessionCache.evictAll(sessions.map { it.toResponseBodyDTO() })

        logger.info("All sessions deleted successfully")
    }
}
