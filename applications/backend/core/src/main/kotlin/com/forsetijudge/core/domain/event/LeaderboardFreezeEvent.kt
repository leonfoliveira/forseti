package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Contest
import org.springframework.context.ApplicationEvent

/**
 * Event triggered when a leaderboard is frozen
 */
class LeaderboardFreezeEvent(
    source: Any,
    val contest: Contest,
) : ApplicationEvent(source)
