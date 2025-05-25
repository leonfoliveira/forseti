package io.leonfoliveira.judge.core.service.dto.output

import java.time.LocalDateTime

object LeaderboardOutputDTOMockFactory {
    fun build(
        contest: LeaderboardOutputDTO.ContestDTO =
            LeaderboardOutputDTO.ContestDTO(
                id = 1,
                title = "Contest Title",
                startAt = LocalDateTime.now(),
                endAt = LocalDateTime.now(),
            ),
        problems: List<LeaderboardOutputDTO.ProblemDTO> = emptyList(),
        members: List<LeaderboardOutputDTO.MemberDTO> = emptyList(),
    ) = LeaderboardOutputDTO(
        contest = contest,
        problems = problems,
        members = members,
    )
}
