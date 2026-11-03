package com.forsetijudge.core.api.listener.contest

import com.forsetijudge.core.api.http.sse.SSE
import com.forsetijudge.core.api.http.sse.SSEHelper
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
import org.mockito.kotlin.never
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class ApiContestUpdatedEventListenerTest {
    private val contestRepository = mock<ContestRepository>()
    private val sseFanoutRedisMessageProducer = mock<SSEFanoutRedisMessageProducer>()
    private val sseHelper = mock<SSEHelper>()
    private val listener = ApiContestUpdatedEventListener(contestRepository, sseFanoutRedisMessageProducer, sseHelper)

    @Test
    fun `should throw NotFoundException when contest does not exist`() {
        val event = ContestEvent.Updated(contestId = IdGenerator.getUUID())
        whenever(contestRepository.findByIdNullable(event.contestId)).thenReturn(null)

        assertThrows<NotFoundException> {
            listener.handle(event)
        }
    }

    @Test
    fun `should produce SSEFanoutMessage for all dashboard rooms when contest is frozen`() {
        val contest = MockEntityFactory.contest()
        val event = ContestEvent.Updated(contestId = contest.id)
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
            assertEquals(SSE.CONTEST_UPDATED.name, message.eventName)
            assertEquals(expected[index][1], message.data)
        }
        verify(sseHelper, never()).completeAll(SSERoomBuilder.buildSpectatorDashboardRoom(event.contestId))
    }

    @Test
    fun `should complete spectator dashboard room when contest is not auto judge enabled`() {
        val contest = MockEntityFactory.contest()
        contest.settings.isSpectatorEnabled = false
        val event = ContestEvent.Updated(contestId = contest.id)
        whenever(contestRepository.findByIdNullable(event.contestId)).thenReturn(contest)

        listener.handle(event)

        verify(sseHelper).completeAll(SSERoomBuilder.buildSpectatorDashboardRoom(event.contestId))
    }
}
