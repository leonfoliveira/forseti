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
    fun save(entity: FrozenSubmission): FrozenSubmission

    fun saveAll(entities: Iterable<FrozenSubmission>): List<FrozenSubmission>

    @Query(
        """SELECT f FROM FrozenSubmission f WHERE f.problem.contest.id = :contestId AND f.status = :status 
           AND CONCAT(f.member.id, ':', f.problem.id) NOT IN :excludedPairs""",
    )
    fun findByContestIdAndStatusAndMemberAndProblemPairsNotIn(
        contestId: UUID,
        status: Submission.Status,
        excludedPairs: Collection<String>,
    ): List<FrozenSubmission>
}
