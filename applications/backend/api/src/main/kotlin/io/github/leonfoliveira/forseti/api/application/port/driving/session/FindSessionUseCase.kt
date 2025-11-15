package io.github.leonfoliveira.forseti.api.application.port.driving.session

import io.github.leonfoliveira.forseti.common.application.domain.entity.Session
import java.util.UUID

interface FindSessionUseCase {
    /**
     * Finds a session by its ID.
     *
     * @param id The ID of the session to find.
     * @return The session if found, null otherwise.
     */
    fun findByIdNullable(id: UUID): Session?
}
