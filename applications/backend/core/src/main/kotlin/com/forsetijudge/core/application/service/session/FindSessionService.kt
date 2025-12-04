package com.forsetijudge.core.application.service.session

import com.forsetijudge.core.domain.entity.Session
import com.forsetijudge.core.port.driven.repository.SessionRepository
import com.forsetijudge.core.port.driving.usecase.session.FindSessionUseCase
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class FindSessionService(
    private val sessionRepository: SessionRepository,
) : FindSessionUseCase {
    override fun findByIdNullable(id: UUID): Session? = sessionRepository.findEntityById(id)
}
