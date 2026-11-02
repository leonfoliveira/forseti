package com.forsetijudge.core.port.output.repository

import com.forsetijudge.core.domain.entity.FrozenSubmission
import com.forsetijudge.core.domain.entity.Submission
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.Query
import java.util.UUID

/**
 * Accessor for persistence operations related to FrozenSubmission entity
 */
interface FrozenSubmissionRepository : BaseRepository<FrozenSubmission> {
    @Query(
        """SELECT f FROM FrozenSubmission f WHERE f.problem.contest.id = ?1 AND f.deletedAt IS NULL""",
    )
    @EntityGraph(attributePaths = ["member", "problem", "code"])
    fun findAllByContestId(contestId: UUID): List<FrozenSubmission>

    @Query(
        """SELECT f FROM FrozenSubmission f WHERE f.problem.contest.id = :contestId AND f.status = :status 
           AND CONCAT(f.member.id, ':', f.problem.id) NOT IN :excludedPairs AND f.deletedAt IS NULL""",
    )
    fun findByContestIdAndStatusAndMemberAndProblemPairsNotIn(
        contestId: UUID,
        status: Submission.Status,
        excludedPairs: Collection<String>,
    ): List<FrozenSubmission>
}
