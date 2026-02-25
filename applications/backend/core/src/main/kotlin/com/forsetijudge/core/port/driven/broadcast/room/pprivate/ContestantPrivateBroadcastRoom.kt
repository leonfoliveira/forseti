package com.forsetijudge.core.port.driven.broadcast.room.pprivate

import com.forsetijudge.core.domain.entity.Clarification
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.entity.Ticket
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.core.port.dto.response.clarification.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeAndExecutionResponseBodyDTO
import com.forsetijudge.core.port.dto.response.ticket.toResponseBodyDTO
import java.util.UUID

class ContestantPrivateBroadcastRoom(
    contestId: UUID,
    memberId: UUID,
) {
    companion object {
        val pattern = Regex("/contests/(?<contestId>[a-f0-9\\-]+)/members/(?<memberId>[a-f0-9\\-]+)/private/contestant")
    }

    private val name = "/contests/$contestId/members/$memberId/private/contestant"

    fun buildClarificationAnsweredEvent(clarification: Clarification) =
        BroadcastEvent(
            room = name,
            name = "CLARIFICATION_ANSWERED",
            data = clarification.toResponseBodyDTO(),
        )

    fun buildSubmissionUpdatedEvent(submission: Submission) =
        BroadcastEvent(
            room = name,
            name = "SUBMISSION_UPDATED",
            data = submission.toWithCodeAndExecutionResponseBodyDTO(),
        )

    fun buildTicketUpdatedEvent(ticket: Ticket<*>) =
        BroadcastEvent(
            room = name,
            name = "TICKET_UPDATED",
            data = ticket.toResponseBodyDTO(),
        )
}
