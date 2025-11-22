package live.forseti.core.application.service.session

import live.forseti.core.domain.entity.Session
import live.forseti.core.port.driven.repository.SessionRepository
import live.forseti.core.port.driving.usecase.session.FindSessionUseCase
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class FindSessionService(
    private val sessionRepository: SessionRepository,
) : FindSessionUseCase {
    override fun findByIdNullable(id: UUID): Session? = sessionRepository.findEntityById(id)
}
