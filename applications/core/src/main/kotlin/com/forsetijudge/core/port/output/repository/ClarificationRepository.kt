package com.forsetijudge.core.port.output.repository

import com.forsetijudge.core.domain.entity.Clarification
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.Query
import java.util.UUID

interface ClarificationRepository : BaseRepository<Clarification> {
    @Query("SELECT c FROM Clarification c WHERE c.id = ?1 AND deletedAt IS NULL")
    @EntityGraph(attributePaths = ["contest", "problem", "member", "answer.member"])
    fun findByIdNullable(id: UUID): Clarification?

    @Query("SELECT c FROM Clarification c WHERE c.id = ?1 AND c.contest.id = ?2 AND deletedAt IS NULL")
    @EntityGraph(attributePaths = ["contest", "problem", "member", "answer.member"])
    fun findByIdAndContestId(
        id: UUID,
        contestId: UUID,
    ): Clarification?

    @Query("SELECT c FROM Clarification c WHERE c.contest.id = ?1 AND deletedAt IS NULL")
    @EntityGraph(attributePaths = ["contest", "problem", "member", "answer.member"])
    fun findAllByContestId(contestId: UUID): List<Clarification>

    @Query("SELECT c FROM Clarification c WHERE c.contest.id = ?1 AND (c.member.id = ?2 OR c.isPublic) AND deletedAt IS NULL")
    @EntityGraph(attributePaths = ["contest", "problem", "member", "answer.member"])
    fun findAllByContestIdAndMemberIdOrIsPublic(
        contestId: UUID,
        memberId: UUID,
    ): List<Clarification>

    @Query("SELECT c FROM Clarification c WHERE c.contest.id = ?1 AND c.isPublic AND deletedAt IS NULL")
    @EntityGraph(attributePaths = ["contest", "problem", "member", "answer.member"])
    fun findAllByContestIdAndIsPublic(contestId: UUID): List<Clarification>
}
