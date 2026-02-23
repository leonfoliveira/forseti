package com.forsetijudge.core.application.service.external.session

import com.forsetijudge.core.domain.entity.Session
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.repository.SessionRepository
import com.forsetijudge.core.port.driving.usecase.external.session.FindSessionByIdUseCase
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class FindSessionByIdService(
    private val sessionRepository: SessionRepository,
) : FindSessionByIdUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @Transactional(readOnly = true)
    override fun execute(command: FindSessionByIdUseCase.Command): Session {
        val contextContestId = ExecutionContext.getContestId()

        logger.info("Finding session with id: {}", command.sessionId)

        val session =
            sessionRepository.findByIdAndContestId(command.sessionId, contextContestId)
                ?: throw NotFoundException("Could not find session with id: ${command.sessionId} for this contest")

        logger.info("Session with id: {} found successfully", command.sessionId)
        return session
    }
}
