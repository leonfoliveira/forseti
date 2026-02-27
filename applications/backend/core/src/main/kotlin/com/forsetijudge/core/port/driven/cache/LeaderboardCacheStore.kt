package com.forsetijudge.core.port.driven.cache

import com.forsetijudge.core.domain.model.Leaderboard
import java.util.UUID

interface LeaderboardCacheStore {
    /**
     * Cache the given leaderboard cell for the specified contest.
     *
     * @param contestId The ID of the contest to which the leaderboard cell belongs.
     * @param cell The leaderboard cell to be cached.
     */
    fun cacheCell(
        contestId: UUID,
        cell: Leaderboard.Cell,
    )

    /**
     * Retrieve a cached leaderboard cell for the specified contest, member, and problem.
     *
     * @param contestId The ID of the contest to which the leaderboard cell belongs.
     * @param memberId The ID of the member for whom to retrieve the leaderboard cell.
     * @param problemId The ID of the problem for which to retrieve the leaderboard cell.
     * @return The cached leaderboard cell for the specified contest, member, and problem, or null if not found.
     */
    fun getCell(
        contestId: UUID,
        memberId: UUID,
        problemId: UUID,
    ): Leaderboard.Cell?

    /**
     * Retrieve all cached leaderboard cells for the specified contest.
     *
     * @param contestId The ID of the contest for which to retrieve the leaderboard cells.
     * @return A list of cached leaderboard cells for the specified contest.
     */
    fun getAllCellsByContestId(contestId: UUID): List<Leaderboard.Cell>
}
