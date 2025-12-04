package com.forsetijudge.core.port.driven.repository

import com.forsetijudge.core.domain.entity.Contest
import java.util.UUID

/**
 * Accessor for persistence operations related to Contest entity
 */
interface ContestRepository : BaseRepository<Contest> {
    fun findEntityById(id: UUID): Contest?

    fun findBySlug(slug: String): Contest?
}
