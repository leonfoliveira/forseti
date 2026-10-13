package com.forsetijudge.core.api.listener.clarification

import com.forsetijudge.core.api.websocket.fanout.SocketIOFanoutRedisMessageProducer
import com.forsetijudge.core.api.websocket.room.SocketIOAdminDashboardRoom
import com.forsetijudge.core.api.websocket.room.SocketIOContestantPrivateRoom
import com.forsetijudge.core.api.websocket.room.SocketIOJudgeDashboardRoom
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.output.repository.ClarificationRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionalEventListener

@Component
@Suppress("unused")
class ApiClarificationCreatedEventListener(
    private val clarificationRepository: ClarificationRepository,
    private val socketIOFanoutRedisMessageProducer: SocketIOFanoutRedisMessageProducer,
) {
    private val logger = SafeLogger(this::class)

    @TransactionalEventListener
    fun handle(event: ClarificationEvent.Created) {
        logger.info("Handling clarification created event for clarification with id: ${event.clarificationId}")

        val clarification =
            clarificationRepository.findById(event.clarificationId)
                ?: throw NotFoundException("Could not find clarification with id: ${event.clarificationId}")
        val contest = clarification.contest
        val member = clarification.member

        socketIOFanoutRedisMessageProducer.produce(
            SocketIOAdminDashboardRoom(contest.id).buildClarificationCreatedEvent(
                clarification,
            ),
        )
        socketIOFanoutRedisMessageProducer.produce(
            SocketIOJudgeDashboardRoom(contest.id).buildClarificationCreatedEvent(
                clarification,
            ),
        )
        socketIOFanoutRedisMessageProducer.produce(
            SocketIOContestantPrivateRoom(contest.id, member.id).buildClarificationCreatedEvent(
                clarification,
            ),
        )
    }
}
