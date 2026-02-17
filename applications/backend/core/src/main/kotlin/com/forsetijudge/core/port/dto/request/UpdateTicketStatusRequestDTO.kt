package com.forsetijudge.core.port.dto.request

import com.forsetijudge.core.domain.entity.Ticket

data class UpdateTicketStatusRequestDTO(
    val status: Ticket.Status,
)
