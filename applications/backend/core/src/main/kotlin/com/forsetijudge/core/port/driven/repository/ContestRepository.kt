package com.forsetijudge.core.port.driven.repository

import com.forsetijudge.core.domain.entity.Contest
import org.springframework.data.jpa.repository.Query
import java.util.UUID

/**
 * Accessor for persistence operations related to Contest entity
 */
interface ContestRepository : BaseRepository<Contest> {
    @Query("SELECT c FROM Contest c WHERE c.id = ?1 AND c.deletedAt IS NULL")
    fun findById(id: UUID): Contest?

    @Query("SELECT c FROM Contest c WHERE c.slug = ?1 AND c.deletedAt IS NULL")
    fun findBySlug(slug: String): Contest?

    @Query("SELECT (COUNT(c) > 0) FROM Contest c WHERE c.slug = ?1 AND c.deletedAt IS NULL")
    fun existsBySlug(slug: String): Boolean

    @Query("SELECT (COUNT(c) > 0) FROM Contest c WHERE c.slug = ?1 AND c.id <> ?2 AND c.deletedAt IS NULL")
    fun existsBySlugAndIdNot(
        slug: String,
        id: UUID,
    ): Boolean

    @Query("SELECT c FROM Contest c WHERE c.deletedAt IS NULL ORDER BY c.createdAt")
    fun findAllOrdersByCreatedAt(): List<Contest>
}
