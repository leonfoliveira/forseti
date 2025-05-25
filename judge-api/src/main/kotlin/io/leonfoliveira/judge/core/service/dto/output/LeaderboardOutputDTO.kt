package io.leonfoliveira.judge.core.service.dto.output

import java.time.LocalDateTime

data class LeaderboardOutputDTO(
    val contest: ContestDTO,
    val problems: List<ProblemDTO>,
    val members: List<MemberDTO>,
) {
    data class ContestDTO(
        val id: Int,
        val title: String,
        val startAt: LocalDateTime,
        val endAt: LocalDateTime,
    )

    data class ProblemDTO(
        val id: Int,
        val title: String,
    )

    data class MemberDTO(
        val id: Int,
        val name: String,
        val problems: List<MemberProblemDTO>,
        val score: Int,
        val penalty: Int,
    ) {
        data class MemberProblemDTO(
            val id: Int,
            val wrongSubmissions: Int,
            val isAccepted: Boolean,
            val penalty: Int,
        )
    }
}
