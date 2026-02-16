package com.forsetijudge.core.port.driving.usecase.leaderboard

import java.util.UUID

interface FreezeLeaderboardUseCase {
    /**
     * Freezes the leaderboard for a specific contest.
     *
     * @param contestId The ID of the contest for which the leaderboard should be frozen.
     * @param memberId The ID of the member who is performing the freeze action.
     */
    fun freeze(
        contestId: UUID,
        memberId: UUID,
    )

    /**
     * Unfreezes the leaderboard for a specific contest.
     *
     * @param contestId The ID of the contest for which the leaderboard should be unfrozen.
     * @param memberId The ID of member who is performing the unfreeze action.
     */
    fun unfreeze(
        contestId: UUID,
        memberId: UUID,
    )
}
