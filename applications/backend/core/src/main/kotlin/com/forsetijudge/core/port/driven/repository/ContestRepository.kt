package com.forsetijudge.core.port.driven.repository

import com.forsetijudge.core.domain.entity.Contest
import org.springframework.data.jpa.repository.Query
import java.util.UUID

/**
 * Accessor for persistence operations related to Contest entity
 */
interface ContestRepository : BaseRepository<Contest> {
    fun findEntityById(id: UUID): Contest?

    fun findBySlug(slug: String): Contest?

    fun existsBySlug(slug: String): Boolean

    @Query("SELECT (COUNT(c) > 0) FROM Contest c WHERE c.slug = ?1 AND c.id <> ?2 AND c.deletedAt IS NULL")
    fun existsBySlugAndIdNot(
        slug: String,
        id: UUID,
    ): Boolean
}
