package com.forsetijudge.core.port.driving.usecase.external.leaderboard

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.port.dto.response.contest.ContestResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.ContestWithMembersAndProblemsResponseBodyDTO

interface UnfreezeLeaderboardUseCase {
    /**
     * Unfreezes the leaderboard od a contest.
     *
     * @return the contest with the unfrozen leaderboard
     */
    fun execute(): ContestWithMembersAndProblemsResponseBodyDTO
}
