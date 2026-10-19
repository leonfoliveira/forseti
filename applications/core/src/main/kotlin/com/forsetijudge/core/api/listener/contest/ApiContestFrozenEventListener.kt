package com.forsetijudge.core.api.listener.contest

import com.forsetijudge.core.api.http.sse.SSE
import com.forsetijudge.core.api.http.sse.SSERoomBuilder
import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutMessage
import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutRedisMessageProducer
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.event.TransactionalEventListener

@Component
@Suppress("unused")
class ApiContestFrozenEventListener(
    private val sseFanoutRedisMessageProducer: SSEFanoutRedisMessageProducer,
) {
    private val logger = SafeLogger(this::class)

    @TransactionalEventListener
    @Transactional(readOnly = true, propagation = Propagation.REQUIRES_NEW)
    fun handle(event: ContestEvent.Frozen) {
        logger.info("Handling contest frozen event for contest with id: ${event.contestId}")

        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildAdminDashboardRoom(event.contestId),
                eventName = SSE.CONTEST_FROZEN.name,
                data = emptyMap<Any, Any>(),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildJudgeDashboardRoom(event.contestId),
                eventName = SSE.CONTEST_FROZEN.name,
                data = emptyMap<Any, Any>(),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildStaffDashboardRoom(event.contestId),
                eventName = SSE.CONTEST_FROZEN.name,
                data = emptyMap<Any, Any>(),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildContestantDashboardRoom(event.contestId),
                eventName = SSE.CONTEST_FROZEN.name,
                data = emptyMap<Any, Any>(),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildSpectatorDashboardRoom(event.contestId),
                eventName = SSE.CONTEST_FROZEN.name,
                data = emptyMap<Any, Any>(),
            ),
        )
    }
}
