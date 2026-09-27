package com.forsetijudge.core.port.input.usecase.leaderboard

import com.forsetijudge.core.port.dto.response.leaderboard.LeaderboardResponseBodyDTO
import java.util.UUID

interface BuildLeaderboardUseCase {
    /**
     * Builds the leaderboard for a specific contest.
     *
     * @return The result of building the leaderboard.
     */
    fun execute(command: Command): LeaderboardResponseBodyDTO

    /**
     * Command class for building the leaderboard.
     *
     * @property contestId The ID of the contest for which the leaderboard is to be built.
     */
    data class Command(
        val contestId: UUID,
    )
}
