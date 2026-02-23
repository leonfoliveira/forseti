package com.forsetijudge.core.port.driven.repository

import com.forsetijudge.core.domain.entity.Submission
import org.springframework.data.jpa.repository.Query
import java.time.OffsetDateTime
import java.util.UUID

/**
 * Accessor for persistence operations related to Submission entity
 */
interface SubmissionRepository : BaseRepository<Submission> {
    fun findById(id: UUID): Submission?

    @Query("SELECT s FROM Submission s WHERE s.id = ?1 AND s.problem.contest.id = ?2 AND deletedAt IS NULL")
    fun findByIdAndContestId(
        id: UUID,
        contestId: UUID,
    ): Submission?

    @Query("SELECT s FROM Submission s WHERE s.id = ?1 AND s.problem.contest.id = ?2 AND s.member.id = ?3 AND deletedAt IS NULL")
    fun findByIdAndContestIdAndMemberId(
        id: UUID,
        contestId: UUID,
        memberId: UUID,
    ): Submission?

    @Query("SELECT s FROM Submission s WHERE s.member.id = ?1 AND s.problem.id = ?2 AND s.status = ?3 AND deletedAt IS NULL")
    fun findAllByMemberIdAndProblemIdAndStatus(
        memberId: UUID,
        problemId: UUID,
        status: Submission.Status,
    ): List<Submission>

    @Query("SELECT s FROM Submission s WHERE s.member.id = ?1 AND s.problem.id = ?2 AND s.answer = ?3 AND deletedAt IS NULL")
    fun findAllByMemberIdAndProblemIdAndAnswer(
        memberId: UUID,
        problemId: UUID,
        answer: Submission.Answer,
    ): List<Submission>

    @Query("SELECT s FROM Submission s WHERE s.problem.contest.id = ?1 AND s.createdAt >= ?2 AND deletedAt IS NULL")
    fun findByContestIdAndCreatedAtGreaterThanEqual(
        contestId: UUID,
        createdAt: OffsetDateTime,
    ): List<Submission>
}
