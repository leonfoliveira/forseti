package com.forsetijudge.core.port.driven.repository

import com.forsetijudge.core.domain.entity.Problem
import java.util.UUID

/**
 * Accessor for persistence operations related to Problem entity
 */
interface ProblemRepository : BaseRepository<Problem> {
    fun findEntityById(id: UUID): Problem?
}
