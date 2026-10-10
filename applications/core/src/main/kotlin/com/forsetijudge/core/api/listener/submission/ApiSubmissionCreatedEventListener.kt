package com.forsetijudge.core.api.listener.submission

import com.forsetijudge.core.api.websocket.fanout.SocketIOFanoutRedisMessageProducer
import com.forsetijudge.core.api.websocket.room.SocketIOAdminDashboardRoom
import com.forsetijudge.core.api.websocket.room.SocketIOContestantDashboardRoom
import com.forsetijudge.core.api.websocket.room.SocketIOGuestDashboardRoom
import com.forsetijudge.core.api.websocket.room.SocketIOJudgeDashboardRoom
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionalEventListener

@Component
@Suppress("unused")
class ApiSubmissionCreatedEventListener(
    private val submissionRepository: SubmissionRepository,
    private val socketIOFanoutRedisMessageProducer: SocketIOFanoutRedisMessageProducer,
) {
    private val logger = SafeLogger(this::class)

    @TransactionalEventListener
    fun handle(event: SubmissionEvent.Created) {
        logger.info("Handling submission created event for submission with id: ${event.submissionId}")

        val submission =
            submissionRepository.findById(event.submissionId)
                ?: throw NotFoundException("Could not find submission with id: ${event.submissionId}")
        val contest = submission.contest

        socketIOFanoutRedisMessageProducer.produce(
            SocketIOAdminDashboardRoom(contest.id).buildSubmissionCreatedEvent(
                submission,
            ),
        )
        socketIOFanoutRedisMessageProducer.produce(
            SocketIOContestantDashboardRoom(contest.id).buildSubmissionCreatedEvent(
                submission,
            ),
        )
        socketIOFanoutRedisMessageProducer.produce(
            SocketIOGuestDashboardRoom(contest.id).buildSubmissionCreatedEvent(
                submission,
            ),
        )
        socketIOFanoutRedisMessageProducer.produce(
            SocketIOJudgeDashboardRoom(contest.id).buildSubmissionCreatedEvent(
                submission,
            ),
        )
    }
}
