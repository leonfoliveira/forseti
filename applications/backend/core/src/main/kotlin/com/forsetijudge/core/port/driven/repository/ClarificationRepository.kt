package com.forsetijudge.core.port.driven.repository

import com.forsetijudge.core.domain.entity.Clarification
import org.springframework.data.jpa.repository.Query
import java.util.UUID

/**
 * Accessor for persistence operations related to Clarification entity
 */
interface ClarificationRepository : BaseRepository<Clarification> {
    fun findEntityById(id: UUID): Clarification?

    @Query("SELECT c FROM Clarification c WHERE c.id = :id AND c.contest.id = :contestId AND c.deletedAt IS NULL")
    fun findByIdAndContestId(
        id: UUID,
        contestId: UUID,
    ): Clarification?
}
