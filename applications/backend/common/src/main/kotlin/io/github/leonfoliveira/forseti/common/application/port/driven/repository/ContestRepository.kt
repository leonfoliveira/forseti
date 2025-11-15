package io.github.leonfoliveira.forseti.common.application.port.driven.repository

import io.github.leonfoliveira.forseti.common.application.domain.entity.Contest
import java.util.UUID

/**
 * Accessor for persistence operations related to Contest entity
 */
interface ContestRepository : BaseRepository<Contest> {
    fun findEntityById(id: UUID): Contest?

    fun findBySlug(slug: String): Contest?
}
