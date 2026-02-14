package com.forsetijudge.core.port.driven.repository

import com.forsetijudge.core.domain.entity.Submission
import org.springframework.data.jpa.repository.Query
import java.util.UUID

/**
 * Accessor for persistence operations related to Submission entity
 */
interface SubmissionRepository : BaseRepository<Submission> {
    fun findEntityById(id: UUID): Submission?

    @Query("select s from Submission s where s.member.id = ?1 and s.problem.id = ?2")
    fun findByMemberIdAndProblemId(
        memberId: UUID,
        problemId: UUID,
    ): List<Submission>
}
