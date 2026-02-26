package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Contest
import java.time.OffsetDateTime

abstract class LeaderboardEvent : BusinessEvent() {
    /**
     * Event triggered when a contest's leaderboard is frozen.
     *
     * @property contest The contest whose leaderboard was frozen.
     */
    class Frozen(
        val contest: Contest,
    ) : LeaderboardEvent()

    /**
     * Event triggered when a contest's leaderboard is unfrozen.
     *
     * @property contest The contest whose leaderboard was unfrozen.
     * @property frozenAt The timestamp when the leaderboard was frozen.
     */
    class Unfrozen(
        val contest: Contest,
        val frozenAt: OffsetDateTime,
    ) : LeaderboardEvent()
}
