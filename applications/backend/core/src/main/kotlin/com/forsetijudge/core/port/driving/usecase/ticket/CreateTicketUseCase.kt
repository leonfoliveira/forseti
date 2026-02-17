package com.forsetijudge.core.port.driving.usecase.ticket

import com.forsetijudge.core.domain.entity.Ticket
import com.forsetijudge.core.port.dto.input.ticket.CreateTicketInputDTO
import java.util.UUID

interface CreateTicketUseCase {
    /**
     * Creates a new ticket for a contest.
     *
     * @param contestId The ID of the contest for which the ticket is being created.
     * @param memberId The ID of the member creating the ticket.
     * @param inputDTO The input data transfer object containing the type and properties of the ticket.
     * @return The created Ticket entity.
     */
    fun create(
        contestId: UUID,
        memberId: UUID,
        inputDTO: CreateTicketInputDTO,
    ): Ticket<*>
}
