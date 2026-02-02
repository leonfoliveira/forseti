package com.forsetijudge.core.port.driven.repository

import com.forsetijudge.core.domain.entity.Problem
import org.springframework.data.jpa.repository.Query
import java.util.UUID

/**
 * Accessor for persistence operations related to Problem entity
 */
interface ProblemRepository : BaseRepository<Problem> {
    fun findEntityById(id: UUID): Problem?

    @Query("SELECT p FROM Problem p WHERE p.id = :id AND p.contest.id = :contestId")
    fun findByIdAndContestId(
        id: UUID,
        contestId: UUID,
    ): Problem?
}
