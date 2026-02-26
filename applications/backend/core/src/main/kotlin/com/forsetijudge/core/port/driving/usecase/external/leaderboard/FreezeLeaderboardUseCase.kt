package com.forsetijudge.core.port.driving.usecase.external.leaderboard

import com.forsetijudge.core.domain.entity.Contest

interface FreezeLeaderboardUseCase {
    /**
     * Freezes the leaderboard of a contest.
     *
     * @return the contest with the frozen leaderboard
     */
    fun execute(): Contest

    /**
     * Command object for freezing the leaderboard.
     */
}
