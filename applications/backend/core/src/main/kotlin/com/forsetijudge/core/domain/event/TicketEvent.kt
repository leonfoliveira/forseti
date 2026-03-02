package com.forsetijudge.core.domain.event

import java.util.UUID

abstract class TicketEvent : BusinessEvent() {
    /**
     * Event triggered when a new ticket is created
     *
     * @property ticket the created ticket
     */
    class Created(
        val ticketId: UUID,
    ) : TicketEvent()

    /**
     * Event triggered when a ticket is updated
     *
     * @property ticket the updated ticket
     */
    class Updated(
        val ticketId: UUID,
    ) : TicketEvent()
}
