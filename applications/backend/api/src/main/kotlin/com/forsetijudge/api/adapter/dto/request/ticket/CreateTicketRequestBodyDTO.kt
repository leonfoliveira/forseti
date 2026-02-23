package com.forsetijudge.api.adapter.dto.request.ticket

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.forsetijudge.core.domain.entity.Ticket

@JsonIgnoreProperties(ignoreUnknown = true)
data class CreateTicketRequestBodyDTO(
    val type: Ticket.Type,
    val properties: Map<String, Any>,
)
