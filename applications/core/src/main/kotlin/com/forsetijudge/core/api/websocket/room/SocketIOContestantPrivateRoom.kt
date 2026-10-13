package com.forsetijudge.core.api.websocket.room

import com.forsetijudge.core.api.websocket.fanout.SocketIOFanoutMessage
import com.forsetijudge.core.domain.entity.Clarification
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.dto.response.clarification.toResponseDTO
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

    fun buildClarificationCreatedEvent(clarification: Clarification) =
        SocketIOFanoutMessage(
            room = name,
            eventName = "CLARIFICATION_CREATED",
            data = clarification.toResponseDTO(),
        )

    fun buildClarificationAnsweredEvent(clarification: Clarification) =
        SocketIOFanoutMessage(
            room = name,
            eventName = "CLARIFICATION_ANSWERED",
            data = clarification.toResponseDTO(),
        )
}
