package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Ticket

abstract class TicketEvent : BusinessEvent() {
    /**
     * Event triggered when a new ticket is created
     *
     * @property ticket the created ticket
     */
    class Created(
        val ticket: Ticket<*>,
    ) : TicketEvent()

    /**
     * Event triggered when a ticket is updated
     *
     * @property ticket the updated ticket
     */
    class Updated(
        val ticket: Ticket<*>,
    ) : TicketEvent()
}
