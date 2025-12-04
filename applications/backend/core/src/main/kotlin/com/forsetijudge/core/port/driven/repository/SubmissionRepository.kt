package com.forsetijudge.core.port.driven.repository

import com.forsetijudge.core.domain.entity.Submission
import java.util.UUID

/**
 * Accessor for persistence operations related to Submission entity
 */
interface SubmissionRepository : BaseRepository<Submission> {
    fun findEntityById(id: UUID): Submission?
}
