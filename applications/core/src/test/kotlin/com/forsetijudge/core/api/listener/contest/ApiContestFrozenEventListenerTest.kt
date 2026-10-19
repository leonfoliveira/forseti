package com.forsetijudge.core.api.listener.contest

import com.forsetijudge.core.api.http.sse.SSE
import com.forsetijudge.core.api.http.sse.SSERoomBuilder
import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutMessage
import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutRedisMessageProducer
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.util.IdGenerator
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.mock
import org.mockito.kotlin.times
import org.mockito.kotlin.verify

class ApiContestFrozenEventListenerTest {
    private val sseFanoutRedisMessageProducer = mock<SSEFanoutRedisMessageProducer>()
    private val listener = ApiContestFrozenEventListener(sseFanoutRedisMessageProducer)

    @Test
    fun `should produce SSEFanoutMessage for all dashboard rooms when contest is frozen`() {
        val event = ContestEvent.Frozen(contestId = IdGenerator.getUUID())

        listener.handle(event)

        val produceCaptor = argumentCaptor<SSEFanoutMessage>()
        verify(sseFanoutRedisMessageProducer, times(5)).produce(produceCaptor.capture())
        val expected =
            listOf(
                SSERoomBuilder.buildAdminDashboardRoom(event.contestId),
                SSERoomBuilder.buildJudgeDashboardRoom(event.contestId),
                SSERoomBuilder.buildStaffDashboardRoom(event.contestId),
                SSERoomBuilder.buildContestantDashboardRoom(event.contestId),
                SSERoomBuilder.buildSpectatorDashboardRoom(event.contestId),
            )
        produceCaptor.allValues.forEachIndexed { index, message ->
            assertEquals(expected[index], message.room)
            assertEquals(SSE.CONTEST_FROZEN.name, message.eventName)
            assertEquals(emptyMap<Any, Any>(), message.data)
        }
    }
}
