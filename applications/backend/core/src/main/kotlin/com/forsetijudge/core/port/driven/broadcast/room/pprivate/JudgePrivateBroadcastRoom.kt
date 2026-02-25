package com.forsetijudge.core.port.driven.broadcast.room.pprivate

import com.forsetijudge.core.domain.entity.Ticket
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.core.port.dto.response.ticket.toResponseBodyDTO
import java.util.UUID

class JudgePrivateBroadcastRoom(
    memberId: UUID,
) {
    companion object {
        val pattern = Regex("/members/(?<memberId>[a-f0-9\\-]+)/private/judge")
    }

    private val name = "/members/$memberId/private/judge"

    fun buildTicketUpdatedEvent(ticket: Ticket<*>) =
        BroadcastEvent(
            room = name,
            name = "TICKET_UPDATED",
            data = ticket.toResponseBodyDTO(),
        )
}
