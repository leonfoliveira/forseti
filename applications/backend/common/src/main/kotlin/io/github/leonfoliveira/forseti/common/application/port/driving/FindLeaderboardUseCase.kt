package io.github.leonfoliveira.forseti.common.application.port.driving

import io.github.leonfoliveira.forseti.common.application.dto.output.LeaderboardOutputDTO
import java.util.UUID

interface FindLeaderboardUseCase {
    /**
     * Finds the leaderboard for a specific contest.
     *
     * @param contestId The ID of the contest to get the leaderboard for.
     * @return The leaderboard data for the contest.
     * @throws NotFoundException if the contest is not found.
     */
    fun findByContestId(contestId: UUID): LeaderboardOutputDTO
}
