package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Ticket
import org.springframework.context.ApplicationEvent

/**
 * Event triggered when a new ticket is created
 */
class TicketCreatedEvent(
    source: Any,
    val ticket: Ticket<*>,
) : ApplicationEvent(source)
