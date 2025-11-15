package io.github.leonfoliveira.forseti.api.application.port.driving

import io.github.leonfoliveira.forseti.common.application.domain.entity.Session
import java.util.UUID

interface FindSessionUseCase {
    fun findByIdNullable(id: UUID): Session?
}
