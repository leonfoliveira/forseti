package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Contest
import org.springframework.context.ApplicationEvent

/**
 * Event triggered when a leaderboard is unfrozen, containing the relevant leaderboard and the list of frozen submissions
 */
class LeaderboardUnfreezeEvent(
    source: Any,
    val contest: Contest,
) : ApplicationEvent(source)
