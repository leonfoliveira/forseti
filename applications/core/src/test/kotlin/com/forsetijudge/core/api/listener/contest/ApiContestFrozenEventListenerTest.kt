package com.forsetijudge.core.api.listener.contest

import com.forsetijudge.core.api.http.sse.SSE
import com.forsetijudge.core.api.http.sse.SSERoomBuilder
import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutMessage
import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutRedisMessageProducer
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.dto.response.contest.toResponseDTO
import com.forsetijudge.core.port.dto.response.contest.toWithMembersAndProblemsResponseDTO
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.util.IdGenerator
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.mock
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class ApiContestFrozenEventListenerTest {
    private val contestRepository = mock<ContestRepository>()
    private val sseFanoutRedisMessageProducer = mock<SSEFanoutRedisMessageProducer>()
    private val listener = ApiContestFrozenEventListener(contestRepository, sseFanoutRedisMessageProducer)

    @Test
    fun `should throw NotFoundException when contest does not exist`() {
        val event = ContestEvent.Frozen(contestId = IdGenerator.getUUID())
        whenever(contestRepository.findByIdNullable(event.contestId)).thenReturn(null)

        assertThrows<NotFoundException> {
            listener.handle(event)
        }
    }

    @Test
    fun `should produce SSEFanoutMessage for all dashboard rooms when contest is frozen`() {
        val contest = MockEntityFactory.contest()
        val event = ContestEvent.Frozen(contestId = contest.id)
        whenever(contestRepository.findByIdNullable(event.contestId)).thenReturn(contest)

        listener.handle(event)

        val produceCaptor = argumentCaptor<SSEFanoutMessage>()
        verify(sseFanoutRedisMessageProducer, times(5)).produce(produceCaptor.capture())
        val expected =
            listOf(
                listOf(
                    SSERoomBuilder.buildAdminDashboardRoom(event.contestId),
                    contest.toWithMembersAndProblemsResponseDTO(),
                ),
                listOf(
                    SSERoomBuilder.buildJudgeDashboardRoom(event.contestId),
                    contest.toWithMembersAndProblemsResponseDTO(),
                ),
                listOf(SSERoomBuilder.buildStaffDashboardRoom(event.contestId), contest.toResponseDTO()),
                listOf(SSERoomBuilder.buildContestantDashboardRoom(event.contestId), contest.toResponseDTO()),
                listOf(SSERoomBuilder.buildSpectatorDashboardRoom(event.contestId), contest.toResponseDTO()),
            )
        produceCaptor.allValues.forEachIndexed { index, message ->
            assertEquals(expected[index][0], message.room)
            assertEquals(SSE.CONTEST_FROZEN.name, message.eventName)
            assertEquals(expected[index][1], message.data)
        }
    }
}
