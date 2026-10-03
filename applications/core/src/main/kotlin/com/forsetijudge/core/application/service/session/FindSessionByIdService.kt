package com.forsetijudge.core.application.service.session

import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.domain.model.Session
import com.forsetijudge.core.port.input.usecase.session.FindSessionByIdUseCase
import com.forsetijudge.core.port.output.cache.SessionCache
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime

@Service
class FindSessionByIdService(
    private val sessionCache: SessionCache,
) : FindSessionByIdUseCase {
    private val logger = SafeLogger(this::class)

    /**
     * @return the session found by the given id
     */
    @Transactional(readOnly = true)
    override fun execute(command: FindSessionByIdUseCase.Command): Session {
        logger.info("Finding session with id: ${command.sessionId}")

        val session =
            sessionCache.get(command.sessionId)
                ?: throw UnauthorizedException("Could not find session with id: ${command.sessionId}")

        if (session.expiresAt <= OffsetDateTime.now()) {
            logger.info("Session has expired")
            sessionCache.evict(session)
            throw UnauthorizedException("Session with id: ${command.sessionId} has expired")
        }

        logger.info("Session found successfully")
        return session
    }
}
