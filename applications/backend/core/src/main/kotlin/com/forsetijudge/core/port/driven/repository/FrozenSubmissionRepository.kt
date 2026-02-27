package com.forsetijudge.core.port.driven.repository

import com.forsetijudge.core.domain.entity.FrozenSubmission
import com.forsetijudge.core.domain.entity.Submission
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.Repository
import java.util.UUID

/**
 * Accessor for persistence operations related to FrozenSubmission entity
 */
interface FrozenSubmissionRepository : Repository<FrozenSubmission, UUID> {
    fun saveAll(entities: Iterable<FrozenSubmission>): List<FrozenSubmission>

    @Query("SELECT fs FROM FrozenSubmission fs WHERE fs.problem.contest.id = :contestId")
    fun findAllByContestId(contestId: UUID): List<FrozenSubmission>

    @Query("SELECT fs FROM FrozenSubmission fs WHERE fs.problem.contest.id = :contestId AND fs.status = :status")
    fun findAllByContestIdAndStatus(
        contestId: UUID,
        status: Submission.Status,
    ): List<FrozenSubmission>
}
