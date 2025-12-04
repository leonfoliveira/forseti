package com.forsetijudge.core.application.service.session

import com.forsetijudge.core.domain.model.RequestContext
import com.forsetijudge.core.port.driven.repository.SessionRepository
import com.forsetijudge.core.port.driving.usecase.session.DeleteSessionUseCase
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime

@Service
class DeleteSessionService(
    private val sessionRepository: SessionRepository,
) : DeleteSessionUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Soft deletes the current session from RequestContext.
     */
    @Transactional
    override fun deleteCurrent() {
        logger.info("Deleting current session")

        val session = RequestContext.getContext().session
        if (session == null) {
            logger.info("No session found in request context")
            return
        }

        session.deletedAt = OffsetDateTime.now()
        sessionRepository.save(session)

        logger.info("Finished deleting session")
    }
}
