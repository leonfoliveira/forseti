package com.forsetijudge.core.port.driven.broadcast.room.pprivate

import com.forsetijudge.core.domain.entity.Ticket
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.core.port.dto.response.ticket.toResponseBodyDTO
import java.util.UUID

class JudgePrivateBroadcastRoom(
    contestId: UUID,
    memberId: UUID,
) {
    companion object {
        val pattern = Regex("/contests/(?<contestId>[a-f0-9\\-]+)/members/(?<memberId>[a-f0-9\\-]+)/private/judge")
    }

    private val name = "/contests/$contestId/members/$memberId/private/judge"

    fun buildTicketUpdatedEvent(ticket: Ticket<*>) =
        BroadcastEvent(
            room = name,
            name = "TICKET_UPDATED",
            data = ticket.toResponseBodyDTO(),
        )
}
