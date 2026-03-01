package com.forsetijudge.core.application.service.external.session

import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.cache.SessionCache
import com.forsetijudge.core.port.driven.repository.SessionRepository
import com.forsetijudge.core.port.driving.usecase.external.session.FindSessionByIdUseCase
import com.forsetijudge.core.port.dto.response.session.SessionResponseBodyDTO
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class FindSessionByIdService(
    private val sessionRepository: SessionRepository,
    private val sessionCache: SessionCache,
) : FindSessionByIdUseCase {
    private val logger = SafeLogger(this::class)

    @Transactional(readOnly = true)
    override fun execute(command: FindSessionByIdUseCase.Command): SessionResponseBodyDTO {
        logger.info("Finding session with id: ${command.sessionId}")

        val session =
            sessionCache.get(command.sessionId)
                ?: run {
                    val dbSession =
                        sessionRepository.findById(command.sessionId)?.toResponseBodyDTO()
                            ?: throw UnauthorizedException("Could not find session with id: ${command.sessionId}")
                    sessionCache.cache(dbSession)
                    dbSession
                }

        if (session.expiresAt <= ExecutionContext.get().startedAt) {
            logger.info("Session has expired")
            sessionCache.evict(session)
            throw UnauthorizedException("Session with id: ${command.sessionId} has expired")
        }

        logger.info("Session found successfully")
        return session
    }
}
