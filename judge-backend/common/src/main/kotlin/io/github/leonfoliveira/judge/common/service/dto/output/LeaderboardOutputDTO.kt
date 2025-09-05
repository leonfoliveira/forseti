package io.github.leonfoliveira.judge.common.service.dto.output

import java.time.OffsetDateTime
import java.util.UUID

data class LeaderboardOutputDTO(
    val contestId: UUID,
    val slug: String,
    val startAt: OffsetDateTime,
    val members: List<MemberDTO>,
    val issuedAt: OffsetDateTime,
) {
    data class MemberDTO(
        val id: UUID,
        val name: String,
        val score: Int,
        val penalty: Int,
        val problems: List<ProblemDTO>,
    )

    data class ProblemDTO(
        val id: UUID,
        val letter: Char,
        val isAccepted: Boolean,
        val acceptedAt: OffsetDateTime? = null,
        val wrongSubmissions: Int,
        val penalty: Int,
    )
}
