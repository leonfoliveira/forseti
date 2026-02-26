package com.forsetijudge.core.port.driving.usecase.external.leaderboard

import com.forsetijudge.core.domain.entity.Contest

interface UnfreezeLeaderboardUseCase {
    /**
     * Unfreezes the leaderboard od a contest.
     *
     * @return the contest with the unfrozen leaderboard
     */
    fun execute(): Contest
}
