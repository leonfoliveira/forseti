package com.forsetijudge.core.application.service.external.session

import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Session
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.repository.SessionRepository
import com.forsetijudge.core.port.driving.usecase.external.session.FindSessionByIdUseCase
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class FindSessionByIdService(
    private val sessionRepository: SessionRepository,
) : FindSessionByIdUseCase {
    private val logger = SafeLogger(this::class)

    @Transactional(readOnly = true)
    override fun execute(command: FindSessionByIdUseCase.Command): Session {
        logger.info("Finding session with id: ${command.sessionId}")

        val session =
            sessionRepository.findById(command.sessionId)
                ?: throw UnauthorizedException("Could not find session with id: ${command.sessionId}")

        if (session.expiresAt < ExecutionContext.get().startedAt) {
            logger.info("Session has expired")
            throw UnauthorizedException("Session with id: ${command.sessionId} has expired")
        }

        logger.info("Session found successfully")
        return session
    }
}
