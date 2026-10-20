package com.forsetijudge.core.api.listener.contest

import com.forsetijudge.core.api.http.sse.SSE
import com.forsetijudge.core.api.http.sse.SSERoomBuilder
import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutMessage
import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutRedisMessageProducer
import com.forsetijudge.core.application.helper.leaderboard.LeaderboardBuilder
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.factory.MockModelFactory
import com.forsetijudge.core.port.dto.response.leaderboard.toResponseDTO
import com.forsetijudge.core.port.dto.response.submission.toResponseDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeAndExecutionResponseDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeResponseDTO
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import java.time.OffsetDateTime
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.mock
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class ApiContestUnfrozenEventListenerTest {
    private val contestRepository = mock<ContestRepository>()
    private val submissionRepository = mock<SubmissionRepository>()
    private val leaderboardBuilder = mock<LeaderboardBuilder>()
    private val sseFanoutRedisMessageProducer = mock<SSEFanoutRedisMessageProducer>()
    private val listener =
        ApiContestUnfrozenEventListener(
            contestRepository = contestRepository,
            submissionRepository = submissionRepository,
            leaderboardBuilder = leaderboardBuilder,
            sseFanoutRedisMessageProducer = sseFanoutRedisMessageProducer,
        )

    @Test
    fun `should produce SSEFanoutMessage for all dashboard rooms when contest is frozen`() {
        val freezeAt = OffsetDateTime.now()
        val contest = MockEntityFactory.contest()
        val leaderboard = MockModelFactory.leaderboard()
        val frozenSubmissions = listOf(MockEntityFactory.submission())
        val event = ContestEvent.Unfrozen(contestId = contest.id, frozenAt = freezeAt)
        whenever(contestRepository.findById(contest.id)).thenReturn(contest)
        whenever(leaderboardBuilder.build(contest)).thenReturn(leaderboard)
        whenever(submissionRepository.findAllByContestAndUpdatedAtAfter(contest.id, freezeAt)).thenReturn(
            frozenSubmissions,
        )

        listener.handle(event)

        val produceCaptor = argumentCaptor<SSEFanoutMessage>()
        verify(sseFanoutRedisMessageProducer, times(5)).produce(produceCaptor.capture())
        val expected =
            listOf(
                listOf(
                    SSERoomBuilder.buildAdminDashboardRoom(event.contestId),
                    mapOf(
                        "leaderboard" to leaderboard.toResponseDTO(),
                        "submissions" to frozenSubmissions.map { it.toWithCodeAndExecutionResponseDTO() },
                    ),
                ),
                listOf(
                    SSERoomBuilder.buildJudgeDashboardRoom(event.contestId),
                    mapOf(
                        "leaderboard" to leaderboard.toResponseDTO(),
                        "submissions" to frozenSubmissions.map { it.toWithCodeAndExecutionResponseDTO() },
                    ),
                ),
                listOf(
                    SSERoomBuilder.buildStaffDashboardRoom(event.contestId),
                    mapOf(
                        "leaderboard" to leaderboard.toResponseDTO(),
                        "submissions" to frozenSubmissions.map { it.toWithCodeResponseDTO() },
                    ),
                ),
                listOf(
                    SSERoomBuilder.buildContestantDashboardRoom(event.contestId),
                    mapOf(
                        "leaderboard" to leaderboard.toResponseDTO(),
                        "submissions" to frozenSubmissions.map { it.toResponseDTO() },
                    ),
                ),
                listOf(
                    SSERoomBuilder.buildSpectatorDashboardRoom(event.contestId),
                    mapOf(
                        "leaderboard" to leaderboard.toResponseDTO(),
                        "submissions" to frozenSubmissions.map { it.toResponseDTO() },
                    ),
                ),
            )
        produceCaptor.allValues.forEachIndexed { index, message ->
            assertEquals(expected[index][0], message.room)
            assertEquals(SSE.CONTEST_UNFROZEN.name, message.eventName)
            assertEquals(expected[index][1], message.data)
        }
    }
}
