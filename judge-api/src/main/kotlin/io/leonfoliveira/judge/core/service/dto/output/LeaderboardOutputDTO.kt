package io.leonfoliveira.judge.core.service.dto.output

data class LeaderboardOutputDTO(
    val contestId: Int,
    val problems: List<LeaderboardProblemOutputDTO>,
    val members: List<LeaderboardMemberOutputDTO>,
) {
    data class LeaderboardProblemOutputDTO(
        val id: Int,
        val title: String,
    )

    data class LeaderboardMemberOutputDTO(
        val id: Int,
        val name: String,
        val problems: List<LeaderboardMemberProblemOutputDTO>,
        val score: Int,
        val penalty: Int,
    ) {
        data class LeaderboardMemberProblemOutputDTO(
            val id: Int,
            val wrongSubmissions: Int,
            val isAccepted: Boolean,
            val penalty: Int,
        )
    }
}