package com.forsetijudge.core.application.service.internal.session

import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.cache.SessionCache
import com.forsetijudge.core.port.driven.repository.SessionRepository
import com.forsetijudge.core.port.driving.usecase.internal.session.DeleteAllSessionsByMemberInternalUseCase
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import org.springframework.stereotype.Service

@Service
class DeleteAllSessionsByMemberInternalService(
    private val sessionRepository: SessionRepository,
    private val sessionCache: SessionCache,
) : DeleteAllSessionsByMemberInternalUseCase {
    private val logger = SafeLogger(this::class)

    override fun execute(command: DeleteAllSessionsByMemberInternalUseCase.Command) {
        logger.info("Deleting all sessions for member with id: ${command.member.id}")

        val sessions =
            sessionRepository.findAllByMemberIdAndExpiresAtGreaterThan(
                command.member.id,
                ExecutionContext.get().startedAt,
            )

        sessions.forEach { it.deletedAt = ExecutionContext.get().startedAt }
        sessionRepository.saveAll(sessions)
        sessionCache.evictAll(sessions.map { it.toResponseBodyDTO() })

        logger.info("All sessions deleted successfully")
    }
}
