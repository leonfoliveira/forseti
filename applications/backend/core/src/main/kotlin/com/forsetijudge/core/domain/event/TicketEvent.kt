package com.forsetijudge.core.domain.event

import java.util.UUID

interface TicketEvent : BusinessEvent {
    /**
     * Event triggered when a new ticket is created
     *
     * @property ticketId the created ticket
     */
    class Created(
        val ticketId: UUID,
    ) : TicketEvent

    /**
     * Event triggered when a ticket is updated
     *
     * @property ticketId the updated ticket
     */
    class Updated(
        val ticketId: UUID,
    ) : TicketEvent
}
