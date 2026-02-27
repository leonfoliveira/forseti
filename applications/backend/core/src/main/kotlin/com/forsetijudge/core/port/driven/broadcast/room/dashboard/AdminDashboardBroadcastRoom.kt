package com.forsetijudge.core.port.driven.broadcast.room.dashboard

import com.forsetijudge.core.domain.entity.Announcement
import com.forsetijudge.core.domain.entity.Clarification
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.entity.Ticket
import com.forsetijudge.core.domain.model.Leaderboard
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.core.port.dto.response.announcement.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.clarification.toIdResponseBodyDTO
import com.forsetijudge.core.port.dto.response.clarification.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.leaderboard.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeAndExecutionResponseBodyDTO
import com.forsetijudge.core.port.dto.response.ticket.toResponseBodyDTO
import java.util.UUID

class AdminDashboardBroadcastRoom(
    contestId: UUID,
) {
    companion object {
        val pattern = Regex("/contests/(?<contestId>[a-f0-9\\-]+)/dashboard/admin")
    }

    private val name = "/contests/$contestId/dashboard/admin"

    fun buildAnnouncementCreatedEvent(announcement: Announcement) =
        BroadcastEvent(
            room = name,
            name = "ANNOUNCEMENT_CREATED",
            data = announcement.toResponseBodyDTO(),
        )

    fun buildClarificationCreatedEvent(clarification: Clarification) =
        BroadcastEvent(
            room = name,
            name = "CLARIFICATION_CREATED",
            data = clarification.toResponseBodyDTO(),
        )

    fun buildClarificationDeletedEvent(clarification: Clarification) =
        BroadcastEvent(
            room = name,
            name = "CLARIFICATION_DELETED",
            data = clarification.toIdResponseBodyDTO(),
        )

    fun buildLeaderboardUpdatedEvent(leaderboardCell: Leaderboard.Cell) =
        BroadcastEvent(
            room = name,
            name = "LEADERBOARD_UPDATED",
            data = leaderboardCell.toResponseBodyDTO(),
        )

    fun buildLeaderboardFrozenEvent() =
        BroadcastEvent(
            room = name,
            name = "LEADERBOARD_FROZEN",
        )

    fun buildLeaderboardUnfrozenEvent(leaderboard: Leaderboard) =
        BroadcastEvent(
            room = name,
            name = "LEADERBOARD_UNFROZEN",
            data = leaderboard.toResponseBodyDTO(),
        )

    fun buildSubmissionCreatedEvent(submission: Submission) =
        BroadcastEvent(
            room = name,
            name = "SUBMISSION_CREATED",
            data = submission.toWithCodeAndExecutionResponseBodyDTO(),
        )

    fun buildSubmissionUpdatedEvent(submission: Submission) =
        BroadcastEvent(
            room = name,
            name = "SUBMISSION_UPDATED",
            data = submission.toWithCodeAndExecutionResponseBodyDTO(),
        )

    fun buildTicketCreatedEvent(ticket: Ticket<*>) =
        BroadcastEvent(
            room = name,
            name = "TICKET_CREATED",
            data = ticket.toResponseBodyDTO(),
        )

    fun buildTicketUpdatedEvent(ticket: Ticket<*>) =
        BroadcastEvent(
            room = name,
            name = "TICKET_UPDATED",
            data = ticket.toResponseBodyDTO(),
        )
}
