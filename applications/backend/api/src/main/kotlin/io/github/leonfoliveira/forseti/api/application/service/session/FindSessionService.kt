package io.github.leonfoliveira.forseti.api.application.service.session

import io.github.leonfoliveira.forseti.api.application.port.driving.FindSessionUseCase
import io.github.leonfoliveira.forseti.common.application.domain.entity.Session
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.SessionRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class FindSessionService(
    private val sessionRepository: SessionRepository,
) : FindSessionUseCase {
    override fun findByIdNullable(id: UUID): Session? = sessionRepository.findEntityById(id)
}
