package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Contest

abstract class LeaderboardEvent(
    val contest: Contest,
) : BusinessEvent<Contest>(contest) {
    /**
     * Event triggered when a contest's leaderboard is frozen.
     *
     * @property contest The contest whose leaderboard was frozen.
     */
    class Frozen(
        contest: Contest,
    ) : LeaderboardEvent(contest)

    /**
     * Event triggered when a contest's leaderboard is unfrozen.
     *
     * @property contest The contest whose leaderboard was unfrozen.
     */
    class Unfrozen(
        contest: Contest,
    ) : LeaderboardEvent(contest)
}
