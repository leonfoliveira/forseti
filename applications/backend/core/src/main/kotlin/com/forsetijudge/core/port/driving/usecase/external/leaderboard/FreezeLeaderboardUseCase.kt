package com.forsetijudge.core.port.driving.usecase.external.leaderboard

interface FreezeLeaderboardUseCase {
    /**
     * Freezes the leaderboard of a contest.
     */
    fun execute()

    /**
     * Command object for freezing the leaderboard.
     */
}
