package com.forsetijudge.core.port.driving.usecase.ticket

import com.forsetijudge.core.domain.entity.Ticket
import com.forsetijudge.core.port.dto.input.ticket.CreateTicketInputDTO
import java.util.UUID

interface UpdateTicketUseCase {
    /**
     * Updates the status of an existing ticket.
     *
     * @param contestId The ID of the contest to which the ticket belongs.
     * @param ticketId The ID of the ticket to be updated.
     * @param staffId The ID of the staff member performing the update.
     * @param status The new status to set for the ticket.
     * @return The updated Ticket entity.
     */
    fun updateStatus(
        contestId: UUID,
        ticketId: UUID,
        staffId: UUID,
        status: Ticket.Status,
    ): Ticket<*>
}
