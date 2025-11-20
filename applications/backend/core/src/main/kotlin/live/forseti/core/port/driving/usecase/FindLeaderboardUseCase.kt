package live.forseti.core.port.driving.usecase

import live.forseti.core.port.dto.output.LeaderboardOutputDTO
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
