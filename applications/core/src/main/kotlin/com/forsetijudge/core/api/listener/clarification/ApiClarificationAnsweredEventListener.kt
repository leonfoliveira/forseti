package com.forsetijudge.core.api.listener.clarification

import com.forsetijudge.core.api.http.sse.SSE
import com.forsetijudge.core.api.http.sse.SSERoomBuilder
import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutMessage
import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutRedisMessageProducer
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.clarification.toResponseDTO
import com.forsetijudge.core.port.output.repository.ClarificationRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.event.TransactionalEventListener

@Component
@Suppress("unused")
class ApiClarificationAnsweredEventListener(
    private val clarificationRepository: ClarificationRepository,
    private val sseFanoutRedisMessageProducer: SSEFanoutRedisMessageProducer,
) {
    private val logger = SafeLogger(this::class)

    @TransactionalEventListener
    @Transactional(readOnly = true, propagation = Propagation.REQUIRES_NEW)
    fun handle(event: ClarificationEvent.Answered) {
        logger.info("Handling clarification answered event for clarification with id: ${event.clarificationId}")

        val clarification =
            clarificationRepository.findByIdNullable(event.clarificationId)
                ?: throw NotFoundException("Could not find clarification with id: ${event.clarificationId}")
        val contest = clarification.contest
        val member = clarification.member

        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildAdminDashboardRoom(contest.id),
                eventName = SSE.CLARIFICATION_ANSWERED.name,
                data = clarification.toResponseDTO(),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildJudgeDashboardRoom(contest.id),
                eventName = SSE.CLARIFICATION_ANSWERED.name,
                data = clarification.toResponseDTO(),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildMemberPrivateRoom(member.id),
                eventName = SSE.CLARIFICATION_ANSWERED.name,
                data = clarification.toResponseDTO(),
            ),
        )
    }
}
