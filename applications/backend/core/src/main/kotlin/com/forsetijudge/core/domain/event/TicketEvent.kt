package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Ticket

abstract class TicketEvent(
    val ticket: Ticket<*>,
) : BusinessEvent<Ticket<*>>(ticket) {
    /**
     * Event triggered when a new ticket is created
     *
     * @property ticket the created ticket
     */
    class Created(
        ticket: Ticket<*>,
    ) : TicketEvent(ticket)

    /**
     * Event triggered when a ticket is updated
     *
     * @property ticket the updated ticket
     */
    class Updated(
        ticket: Ticket<*>,
    ) : TicketEvent(ticket)
}
