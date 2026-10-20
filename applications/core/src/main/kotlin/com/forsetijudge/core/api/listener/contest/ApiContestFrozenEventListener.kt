package com.forsetijudge.core.api.listener.contest

import com.forsetijudge.core.api.http.sse.SSE
import com.forsetijudge.core.api.http.sse.SSERoomBuilder
import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutMessage
import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutRedisMessageProducer
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.contest.toResponseDTO
import com.forsetijudge.core.port.dto.response.contest.toWithMembersAndProblemsResponseDTO
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.event.TransactionalEventListener

@Component
@Suppress("unused")
class ApiContestFrozenEventListener(
    private val contestRepository: ContestRepository,
    private val sseFanoutRedisMessageProducer: SSEFanoutRedisMessageProducer,
) {
    private val logger = SafeLogger(this::class)

    @TransactionalEventListener
    @Transactional(readOnly = true, propagation = Propagation.REQUIRES_NEW)
    fun handle(event: ContestEvent.Frozen) {
        logger.info("Handling contest frozen event for contest with id: ${event.contestId}")

        val contest =
            contestRepository.findById(event.contestId)
                ?: throw NotFoundException("Could not find contest with id ${event.contestId}")

        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildAdminDashboardRoom(event.contestId),
                eventName = SSE.CONTEST_FROZEN.name,
                data = contest.toWithMembersAndProblemsResponseDTO(),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildJudgeDashboardRoom(event.contestId),
                eventName = SSE.CONTEST_FROZEN.name,
                data = contest.toWithMembersAndProblemsResponseDTO(),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildStaffDashboardRoom(event.contestId),
                eventName = SSE.CONTEST_FROZEN.name,
                data = contest.toResponseDTO(),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildContestantDashboardRoom(event.contestId),
                eventName = SSE.CONTEST_FROZEN.name,
                data = contest.toResponseDTO(),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildSpectatorDashboardRoom(event.contestId),
                eventName = SSE.CONTEST_FROZEN.name,
                data = contest.toResponseDTO(),
            ),
        )
    }
}
