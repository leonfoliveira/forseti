package com.forsetijudge.core.port.output.repository

import com.forsetijudge.core.domain.entity.PrintRequest
import java.util.UUID
import org.springframework.data.jpa.repository.Query

interface PrintRequestRepository : BaseRepository<PrintRequest> {
    @Query("SELECT pr FROM PrintRequest pr WHERE pr.id = :id AND pr.submission.contest.id = :contestId AND pr.deletedAt IS NULL")
    fun findByIdAndContestId(
        id: UUID,
        contestId: UUID,
    ): PrintRequest?

    @Query("SELECT pr FROM PrintRequest pr WHERE pr.submission.contest.id = :contestId AND pr.deletedAt IS NULL")
    fun findAllByContestId(contestId: UUID): List<PrintRequest>

    @Query(
        "SELECT pr FROM PrintRequest pr WHERE pr.submission.contest.id = :contestId AND pr.submission.member.id = :memberId AND pr.deletedAt IS NULL",
    )
    fun findAllByContestIdAndMemberId(
        contestId: UUID,
        memberId: UUID,
    ): List<PrintRequest>
}
