package com.forsetijudge.core.port.driving.usecase.leaderboard

import com.forsetijudge.core.port.dto.output.LeaderboardOutputDTO
import com.forsetijudge.core.port.dto.output.LeaderboardPartialOutputDTO
import java.util.UUID

interface BuildLeaderboardUseCase {
    /**
     * Finds the leaderboard for a specific contest.
     *
     * @param contestId The ID of the contest to get the leaderboard for.
     * @param memberId The ID of the member requesting the leaderboard.
     * @return The leaderboard data for the contest.
     * @throws NotFoundException if the contest is not found.
     */
    fun build(
        contestId: UUID,
        memberId: UUID?,
    ): LeaderboardOutputDTO

    /**
     * Finds the cell of the leaderboard for a specific submission member and problem.
     *
     * @param memberId The ID of the member to get the leaderboard cell for.
     * @param problemId The ID of the problem to get the leaderboard cell for.
     * @return The partial leaderboard data for the submission.
     */
    fun buildPartial(
        memberId: UUID,
        problemId: UUID,
    ): LeaderboardPartialOutputDTO
}
