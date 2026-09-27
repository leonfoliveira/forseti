package com.forsetijudge.core.application.service.session

import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.port.dto.response.session.SessionResponseBodyDTO
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.session.FindSessionByIdUseCase
import com.forsetijudge.core.port.output.cache.SessionCache
import com.forsetijudge.core.port.output.repository.SessionRepository
import com.forsetijudge.core.util.SafeLogger
import java.time.OffsetDateTime
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class FindSessionByIdService(
    private val sessionRepository: SessionRepository,
    private val sessionCache: SessionCache,
) : FindSessionByIdUseCase {
    private val logger = SafeLogger(this::class)

    /**
     * @return the session found by the given id
     */
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

        if (session.expiresAt <= OffsetDateTime.now()) {
            logger.info("Session has expired")
            sessionCache.evict(session)
            throw UnauthorizedException("Session with id: ${command.sessionId} has expired")
        }

        logger.info("Session found successfully")
        return session
    }
}
