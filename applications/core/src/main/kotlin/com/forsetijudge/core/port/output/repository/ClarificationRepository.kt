package com.forsetijudge.core.port.output.repository

import com.forsetijudge.core.domain.entity.Clarification
import java.util.UUID
import org.springframework.data.jpa.repository.Query

interface ClarificationRepository {
    @Query("SELECT c FROM Clarification c WHERE c.id = ?1 AND deletedAt IS NULL")
    fun findById(id: UUID): Clarification?

    @Query("SELECT c FROM Clarification c WHERE c.contestId = ?1 AND (c.memberId = ?2 OR c.isPublic) AND deletedAt IS NULL")
    fun findAllByContestIdAndMemberIdOrIsPublic(
        contestId: UUID,
        memberId: UUID,
    ): List<Clarification>

    @Query("SELECT c FROM Clarification c WHERE c.contestId = ?1 AND c.isPublic AND deletedAt IS NULL")
    fun findAllByContestIdAndIsPublic(contestId: UUID): List<Clarification>
}
