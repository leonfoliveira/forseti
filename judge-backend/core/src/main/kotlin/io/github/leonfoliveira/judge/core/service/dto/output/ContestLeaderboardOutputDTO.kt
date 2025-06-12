package io.github.leonfoliveira.judge.core.service.dto.output

import java.time.OffsetDateTime
import java.util.UUID

data class ContestLeaderboardOutputDTO(
    val contestId: UUID,
    val slug: String,
    val startAt: OffsetDateTime,
    val classification: List<MemberDTO>,
    val issuedAt: OffsetDateTime,
) {
    data class MemberDTO(
        val memberId: UUID,
        val name: String,
        val score: Int,
        val penalty: Int,
        val problems: List<ProblemDTO>,
    )

    data class ProblemDTO(
        val problemId: UUID,
        val letter: Char,
        val isAccepted: Boolean,
        val wrongSubmissions: Int,
        val penalty: Int,
    )
}
