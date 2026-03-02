package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Contest
import java.time.OffsetDateTime
import java.util.UUID

abstract class LeaderboardEvent : BusinessEvent() {
    /**
     * Event triggered when a contest's leaderboard is frozen.
     *
     * @property contest The contest whose leaderboard was frozen.
     */
    class Frozen(
        val contestId: UUID,
    ) : LeaderboardEvent()

    /**
     * Event triggered when a contest's leaderboard is unfrozen.
     *
     * @property contest The contest whose leaderboard was unfrozen.
     * @property frozenAt The timestamp when the leaderboard was frozen.
     */
    class Unfrozen(
        val contestId: UUID,
        val frozenAt: OffsetDateTime,
    ) : LeaderboardEvent()
}
