package com.forsetijudge.core.port.output.cache

import com.forsetijudge.core.domain.model.Leaderboard
import java.util.UUID

interface LeaderboardCacheStore {
    /**
     * Caches a cell of the leaderboard.
     *
     * @param contestId The ID of the contest to which the cell belongs.
     * @param row The row to be cached.
     */
    fun cacheCell(
        contestId: UUID,
        row: Leaderboard.Cell,
    )

    /**
     * Retrieves all cached cells of the leaderboard for a given contest.
     *
     * @param contestId The ID of the contest for which to retrieve the cached cells.
     * @return A list of cached cells for the specified contest.
     */
    fun getCellsByContestId(contestId: String): List<Leaderboard.Cell>
}
