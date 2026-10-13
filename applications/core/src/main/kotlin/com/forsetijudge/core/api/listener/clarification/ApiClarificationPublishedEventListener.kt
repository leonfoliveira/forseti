package com.forsetijudge.core.api.listener.clarification

import com.forsetijudge.core.api.websocket.fanout.SocketIOFanoutRedisMessageProducer
import com.forsetijudge.core.api.websocket.room.SocketIOAdminDashboardRoom
import com.forsetijudge.core.api.websocket.room.SocketIOContestantDashboardRoom
import com.forsetijudge.core.api.websocket.room.SocketIOGuestDashboardRoom
import com.forsetijudge.core.api.websocket.room.SocketIOJudgeDashboardRoom
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.output.repository.ClarificationRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.event.TransactionalEventListener

@Component
@Suppress("unused")
class ApiClarificationPublishedEventListener(
    private val clarificationRepository: ClarificationRepository,
    private val socketIOFanoutRedisMessageProducer: SocketIOFanoutRedisMessageProducer,
) {
    private val logger = SafeLogger(this::class)

    @TransactionalEventListener
    @Transactional(readOnly = true, propagation = Propagation.REQUIRES_NEW)
    fun handle(event: ClarificationEvent.Published) {
        logger.info("Handling clarification published event for clarification with id: ${event.clarificationId}")

        val clarification =
            clarificationRepository.findById(event.clarificationId)
                ?: throw NotFoundException("Could not find clarification with id: ${event.clarificationId}")
        val contest = clarification.contest

        socketIOFanoutRedisMessageProducer.produce(
            SocketIOAdminDashboardRoom(contest.id).buildClarificationPublishedEvent(
                clarification,
            ),
        )
        socketIOFanoutRedisMessageProducer.produce(
            SocketIOJudgeDashboardRoom(contest.id).buildClarificationPublishedEvent(
                clarification,
            ),
        )
        socketIOFanoutRedisMessageProducer.produce(
            SocketIOContestantDashboardRoom(contest.id).buildClarificationPublishedEvent(
                clarification,
            ),
        )
        socketIOFanoutRedisMessageProducer.produce(
            SocketIOGuestDashboardRoom(contest.id).buildClarificationPublishedEvent(
                clarification,
            ),
        )
    }
}
