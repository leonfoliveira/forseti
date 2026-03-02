package com.forsetijudge.core.port.driving.usecase.internal.leaderboard

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.model.Leaderboard
import com.forsetijudge.core.port.dto.response.leaderboard.LeaderboardResponseBodyDTO

interface BuildLeaderboardInternalUseCase {
    /**
     * Builds the leaderboard for a specific contest.
     *
     * @return The result of building the leaderboard, including the leaderboard data.
     */
    fun execute(command: Command): Leaderboard

    /**
     * Command for building the leaderboard.
     *
     * @property bypassFreeze Whether to bypass the freeze period when building the leaderboard. Default is false.
     */
    data class Command(
        val contest: Contest,
        val bypassFreeze: Boolean = false,
    )
}
