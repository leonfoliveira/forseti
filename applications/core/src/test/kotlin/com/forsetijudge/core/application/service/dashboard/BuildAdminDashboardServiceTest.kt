package com.forsetijudge.core.application.service.dashboard

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.application.helper.leaderboard.LeaderboardBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.factory.MockModelFactory
import com.forsetijudge.core.port.input.usecase.dashboard.BuildAdminDashboardUseCase
import com.forsetijudge.core.port.output.repository.ClarificationRepository
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class BuildAdminDashboardServiceTest {
    private val contestRepository = mock<ContestRepository>()
    private val memberRepository = mock<MemberRepository>()
    private val submissionRepository = mock<SubmissionRepository>()
    private val clarificationRepository = mock<ClarificationRepository>()
    private val leaderboardBuilder = mock<LeaderboardBuilder>()
    private val service =
        BuildAdminDashboardService(
            contestRepository,
            memberRepository,
            submissionRepository,
            clarificationRepository,
            leaderboardBuilder,
        )

    @AfterEach
    fun clearAuthentication() = TestAuthentication.clear()

    @Test
    fun `builds dashboard for root`() {
        val contest = MockEntityFactory.contest()
        val root = MockEntityFactory.member(type = Member.Type.ROOT)
        TestAuthentication.setMember(root)
        whenever(contestRepository.findById(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(root.id, contest.id)).thenReturn(root)
        whenever(
            leaderboardBuilder.build(
                contest,
                true,
            ),
        ).thenReturn(MockModelFactory.leaderboard(contestId = contest.id))
        whenever(submissionRepository.findAllByContestId(contest.id)).thenReturn(emptyList())
        whenever(clarificationRepository.findAllByContestId(contest.id)).thenReturn(emptyList())

        val result = service.execute(BuildAdminDashboardUseCase.Command(contest.id))

        assertEquals(contest.id, result.contest.id)
        verify(leaderboardBuilder).build(contest, true)
        verify(submissionRepository).findAllByContestId(contest.id)
    }

    @Test
    fun `rejects contestants and missing contest`() {
        val contest = MockEntityFactory.contest()
        val contestant = MockEntityFactory.member(contest = contest)
        TestAuthentication.setMember(contestant)
        whenever(contestRepository.findById(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(contestant.id, contest.id)).thenReturn(contestant)
        assertThrows(ForbiddenException::class.java) {
            service.execute(BuildAdminDashboardUseCase.Command(contest.id))
        }
        verify(leaderboardBuilder, never()).build(any(), any())

        whenever(contestRepository.findById(contest.id)).thenReturn(null)
        assertThrows(NotFoundException::class.java) {
            service.execute(BuildAdminDashboardUseCase.Command(contest.id))
        }
    }
}
