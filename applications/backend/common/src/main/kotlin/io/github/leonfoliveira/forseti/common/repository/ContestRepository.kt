package io.github.leonfoliveira.forseti.common.repository

import io.github.leonfoliveira.forseti.common.domain.entity.Contest

/**
 * Accessor for persistence operations related to Contest entity
 */
interface ContestRepository : BaseRepository<Contest> {
    fun findBySlug(slug: String): Contest?
}
