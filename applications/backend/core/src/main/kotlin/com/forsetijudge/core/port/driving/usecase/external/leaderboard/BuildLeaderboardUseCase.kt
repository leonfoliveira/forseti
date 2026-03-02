package com.forsetijudge.core.port.driving.usecase.external.leaderboard

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.port.dto.response.leaderboard.LeaderboardResponseBodyDTO

interface BuildLeaderboardUseCase {
    /**
     * Builds the leaderboard for a specific contest.
     *
     * @return The result of building the leaderboard, including the leaderboard data.
     */
    fun execute(command: Command): LeaderboardResponseBodyDTO

    /**
     * Command for building the leaderboard.
     *
     * @property bypassFreeze Whether to bypass the freeze period when building the leaderboard. Default is false.
     */
    data class Command(
        val bypassFreeze: Boolean = false,
    )
}
