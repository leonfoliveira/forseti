package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Contest
import org.springframework.context.ApplicationEvent

/**
 * Event triggered when a contest is created
 *
 * @param source The source of the event, typically the service that created the contest
 * @param contest The contest that was created
 */
class ContestCreatedEvent(
    source: Any,
    val contest: Contest,
) : ApplicationEvent(source)
