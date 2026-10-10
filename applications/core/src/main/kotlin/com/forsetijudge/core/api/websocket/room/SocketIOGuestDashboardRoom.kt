package com.forsetijudge.core.api.websocket.room

import com.forsetijudge.core.api.websocket.fanout.SocketIOFanoutMessage
import com.forsetijudge.core.domain.entity.Announcement
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.model.Leaderboard
import com.forsetijudge.core.port.dto.response.announcement.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.leaderboard.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toResponseBodyDTO
import java.util.UUID

class SocketIOGuestDashboardRoom(
    contestId: UUID,
) {
    private val name = "/contests/$contestId/dashboard/guest"

    fun buildLeaderboardUpdatedEvent(leaderboardCell: Leaderboard.Cell) =
        SocketIOFanoutMessage(
            room = name,
            eventName = "LEADERBOARD_UPDATED",
            data = leaderboardCell.toResponseBodyDTO(),
        )

    fun buildSubmissionCreatedEvent(submission: Submission) =
        SocketIOFanoutMessage(
            room = name,
            eventName = "SUBMISSION_CREATED",
            data = submission.toResponseBodyDTO(),
        )

    fun buildSubmissionUpdatedEvent(submission: Submission) =
        SocketIOFanoutMessage(
            room = name,
            eventName = "SUBMISSION_UPDATED",
            data = submission.toResponseBodyDTO(),
        )

    fun buildAnnouncementCreatedEvent(announcement: Announcement) =
        SocketIOFanoutMessage(
            room = name,
            eventName = "ANNOUNCEMENT_CREATED",
            data = announcement.toResponseBodyDTO(),
        )
}
