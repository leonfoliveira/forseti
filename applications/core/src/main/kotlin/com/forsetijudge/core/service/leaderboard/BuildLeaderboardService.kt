package com.forsetijudge.core.service.leaderboard

import com.forsetijudge.core.port.dto.response.leaderboard.LeaderboardResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.leaderboard.BuildLeaderboardUseCase

class BuildLeaderboardService : BuildLeaderboardUseCase {
    /**
     * Builds the leaderboard for a specific contest.
     *
     * @return The result of building the leaderboard.
     */
    override fun execute(): LeaderboardResponseBodyDTO {
        TODO("Not yet implemented")
    }
}
