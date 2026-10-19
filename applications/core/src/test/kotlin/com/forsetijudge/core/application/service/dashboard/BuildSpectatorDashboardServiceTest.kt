package com.forsetijudge.core.application.service.dashboard

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.application.helper.leaderboard.LeaderboardBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.factory.MockModelFactory
import com.forsetijudge.core.port.input.usecase.dashboard.BuildSpectatorDashboardUseCase
import com.forsetijudge.core.port.output.repository.ClarificationRepository
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.FrozenSubmissionRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import java.time.OffsetDateTime
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class BuildSpectatorDashboardServiceTest {
    private val contestRepository = mock<ContestRepository>()
    private val submissionRepository = mock<SubmissionRepository>()
    private val frozenSubmissionRepository = mock<FrozenSubmissionRepository>()
    private val clarificationRepository = mock<ClarificationRepository>()
    private val leaderboardBuilder = mock<LeaderboardBuilder>()
    private val service =
        BuildSpectatorDashboardService(
            contestRepository,
            submissionRepository,
            frozenSubmissionRepository,
            clarificationRepository,
            leaderboardBuilder,
        )

    @Test
    fun `builds public dashboard after contest starts`() {
        TestAuthentication.clear()
        val contest = MockEntityFactory.contest(startAt = OffsetDateTime.now().minusMinutes(1))
        whenever(contestRepository.findById(contest.id)).thenReturn(contest)
        whenever(leaderboardBuilder.build(contest)).thenReturn(MockModelFactory.leaderboard(contestId = contest.id))
        whenever(submissionRepository.findAllByContestId(contest.id)).thenReturn(emptyList())
        whenever(frozenSubmissionRepository.findAllByContestId(contest.id)).thenReturn(emptyList())
        whenever(clarificationRepository.findAllByContestIdAndIsPublic(contest.id)).thenReturn(emptyList())

        assertEquals(contest.id, service.execute(BuildSpectatorDashboardUseCase.Command(contest.id)).contest.id)
        verify(leaderboardBuilder).build(contest)
    }

    @Test
    fun `rejects spectator before contest starts and missing contest`() {
        TestAuthentication.clear()
        val contest = MockEntityFactory.contest(startAt = OffsetDateTime.now().plusHours(1))
        whenever(contestRepository.findById(contest.id)).thenReturn(contest)
        assertThrows(ForbiddenException::class.java) {
            service.execute(BuildSpectatorDashboardUseCase.Command(contest.id))
        }
        verify(leaderboardBuilder, never()).build(any())

        whenever(contestRepository.findById(contest.id)).thenReturn(null)
        assertThrows(NotFoundException::class.java) {
            service.execute(BuildSpectatorDashboardUseCase.Command(contest.id))
        }
    }
}
