package com.forsetijudge.core.port.driven.broadcast.room.dashboard

import com.forsetijudge.core.domain.entity.Announcement
import com.forsetijudge.core.domain.entity.Clarification
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.model.Leaderboard
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.core.port.dto.response.announcement.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.clarification.toIdResponseBodyDTO
import com.forsetijudge.core.port.dto.response.clarification.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.leaderboard.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toResponseBodyDTO
import java.io.Serializable
import java.util.UUID

class ContestantDashboardBroadcastRoom(
    contestId: UUID,
) {
    companion object {
        val pattern = Regex("/contests/(?<contestId>[a-f0-9\\-]+)/dashboard/contestant")
    }

    private val name = "/contests/$contestId/dashboard/contestant"

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

    fun buildLeaderboardUnfrozenEvent(
        leaderboard: Leaderboard,
        frozenSubmissions: List<Submission>,
    ) = BroadcastEvent(
        room = name,
        name = "LEADERBOARD_UNFROZEN",
        data =
            mapOf(
                "leaderboard" to leaderboard.toResponseBodyDTO(),
                "frozenSubmissions" to frozenSubmissions.map { it.toResponseBodyDTO() },
            ) as Serializable,
    )

    fun buildSubmissionCreatedEvent(submission: Submission) =
        BroadcastEvent(
            room = name,
            name = "SUBMISSION_CREATED",
            data = submission.toResponseBodyDTO(),
        )

    fun buildSubmissionUpdatedEvent(submission: Submission) =
        BroadcastEvent(
            room = name,
            name = "SUBMISSION_UPDATED",
            data = submission.toResponseBodyDTO(),
        )
}
