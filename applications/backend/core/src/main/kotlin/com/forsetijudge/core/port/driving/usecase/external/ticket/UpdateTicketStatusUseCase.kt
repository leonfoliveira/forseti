package com.forsetijudge.core.port.driving.usecase.external.ticket

import com.forsetijudge.core.domain.entity.Ticket
import java.util.UUID

interface UpdateTicketStatusUseCase {
    /**
     * Updates the status of a ticket.
     *
     * @param command The command containing the ticket ID and the new status.
     * @return The result of the update operation, including the updated ticket details.
     */
    fun execute(command: Command): Ticket<*>

    /**
     * Command for updating the status of a ticket.
     *
     * @param ticketId The ID of the ticket to be updated.
     * @param status The new status to be set for the ticket.
     */
    data class Command(
        val ticketId: UUID,
        val status: Ticket.Status,
    )
}
