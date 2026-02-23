package com.forsetijudge.core.application.service.internal.session

import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.repository.SessionRepository
import com.forsetijudge.core.port.driving.usecase.internal.session.DeleteAllSessionsByMemberInternalUseCase
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class DeleteAllSessionsByMemberInternalService(
    private val sessionRepository: SessionRepository,
) : DeleteAllSessionsByMemberInternalUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    override fun execute(command: DeleteAllSessionsByMemberInternalUseCase.Command) {
        logger.info("Deleting all sessions for member with id: {}", command.member.id)

        val sessions =
            sessionRepository.findAllByMemberIdAndExpiresAtGreaterThan(
                command.member.id,
                ExecutionContext.get().startedAt,
            )

        sessions.forEach { it.deletedAt = ExecutionContext.get().startedAt }
        sessionRepository.saveAll(sessions)

        logger.info("All sessions deleted successfully")
    }
}
