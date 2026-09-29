package com.forsetijudge.core.api.websocket.room

import com.forsetijudge.core.api.websocket.fanout.SocketIOFanoutMessage
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.dto.response.submission.toWithCodeAndExecutionResponseBodyDTO
import java.util.UUID

class SocketIOContestantPrivateRoom(
    contestId: UUID,
    memberId: UUID,
) {
    private val name = "/contests/$contestId/members/$memberId/private/contestant"

    fun buildSubmissionUpdatedEvent(submission: Submission) =
        SocketIOFanoutMessage(
            room = name,
            eventName = "SUBMISSION_UPDATED",
            data = submission.toWithCodeAndExecutionResponseBodyDTO(),
        )
}
