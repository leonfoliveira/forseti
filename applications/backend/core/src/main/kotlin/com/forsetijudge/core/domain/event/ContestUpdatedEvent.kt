package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Contest
import org.springframework.context.ApplicationEvent

/**
 * Event triggered when a contest is updated
 *
 * @param source The source of the event, typically the service that updated the contest
 * @param contest The contest that was updated
 */
class ContestUpdatedEvent(
    source: Any,
    val contest: Contest,
) : ApplicationEvent(source)
