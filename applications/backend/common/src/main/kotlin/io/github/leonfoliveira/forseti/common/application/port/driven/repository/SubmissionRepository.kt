package io.github.leonfoliveira.forseti.common.application.port.driven.repository

import io.github.leonfoliveira.forseti.common.application.domain.entity.Submission
import java.util.UUID

/**
 * Accessor for persistence operations related to Submission entity
 */
interface SubmissionRepository : BaseRepository<Submission> {
    fun findEntityById(id: UUID): Submission?
}
