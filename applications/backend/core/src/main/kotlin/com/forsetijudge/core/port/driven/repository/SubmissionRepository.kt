package com.forsetijudge.core.port.driven.repository

import com.forsetijudge.core.domain.entity.Submission
import org.springframework.data.jpa.repository.Query
import java.time.OffsetDateTime
import java.util.UUID

/**
 * Accessor for persistence operations related to Submission entity
 */
interface SubmissionRepository : BaseRepository<Submission> {
    fun findEntityById(id: UUID): Submission?

    @Query("select s from Submission s where s.member.id = ?1 and s.problem.id = ?2 and s.status = ?3")
    fun findAllByMemberIdAndProblemIdAndStatus(
        memberId: UUID,
        problemId: UUID,
        status: Submission.Status,
    ): List<Submission>

    @Query("select s from Submission s where s.createdAt >= ?1")
    fun findAllByCreatedAtGreaterThanEqual(createdAt: OffsetDateTime): List<Submission>
}
