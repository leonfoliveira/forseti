package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Contest
import org.springframework.context.ApplicationEvent

/**
 * Event published when a contest is deleted.
 *
 * @param source the object on which the event initially occurred
 * @param contest the contest that was deleted
 */
class ContestDeletedEvent(
    source: Any,
    val contest: Contest,
) : ApplicationEvent(source)
