package com.forsetijudge.core.port.driving.usecase.external.leaderboard

import com.forsetijudge.core.domain.model.Leaderboard

interface BuildLeaderboardUseCase {
    /**
     * Builds the leaderboard for a specific contest.
     *
     * @return The result of building the leaderboard, including the leaderboard data.
     */
    fun execute(): Leaderboard
}
