package io.leonfoliveira.judge.core.service.dto.output

object LeaderboardOutputDTOMockFactory {
    fun build(
        contestId: Int = 1,
        problems: List<LeaderboardOutputDTO.ProblemDTO> = emptyList(),
        members: List<LeaderboardOutputDTO.MemberDTO> = emptyList(),
    ) = LeaderboardOutputDTO(
        contestId = contestId,
        problems = problems,
        members = members,
    )
}
