package com.forsetijudge.core.port.input.usecase.leaderboard

import com.forsetijudge.core.port.dto.response.contest.ContestWithMembersAndProblemsResponseBodyDTO

interface FreezeLeaderboardUseCase {
    /**
     * Freezes the leaderboard of a contest.
     *
     * @return the contest with the frozen leaderboard
     */
    fun execute(): ContestWithMembersAndProblemsResponseBodyDTO
}
