package com.forsetijudge.core.port.output.repository

import com.forsetijudge.core.domain.entity.Problem
import java.util.UUID
import org.springframework.data.jpa.repository.Query

/**
 * Accessor for persistence operations related to Problem entity
 */
interface ProblemRepository : BaseRepository<Problem> {
    @Query("SELECT p FROM Problem p WHERE p.id = ?1 AND p.deletedAt IS NULL")
    fun findById(id: UUID): Problem?

    @Query("SELECT p FROM Problem p WHERE p.id = ?1 AND p.contest.id = ?2 AND p.deletedAt IS NULL")
    fun findByIdAndContestId(
        id: UUID,
        contestId: UUID,
    ): Problem?
}
