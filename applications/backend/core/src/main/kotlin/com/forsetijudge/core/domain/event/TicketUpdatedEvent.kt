package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Ticket
import org.springframework.context.ApplicationEvent

/**
 * Event triggered when a ticket is updated
 */
class TicketUpdatedEvent(
    source: Any,
    val ticket: Ticket<*>,
) : ApplicationEvent(source)
