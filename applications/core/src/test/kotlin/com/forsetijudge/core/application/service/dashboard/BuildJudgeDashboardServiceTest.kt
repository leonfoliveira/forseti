package com.forsetijudge.core.application.service.dashboard

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.application.helper.leaderboard.LeaderboardBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.factory.MockModelFactory
import com.forsetijudge.core.port.input.usecase.dashboard.BuildJudgeDashboardUseCase
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

class BuildJudgeDashboardServiceTest {
    private val contestRepository = mock<ContestRepository>()
    private val memberRepository = mock<MemberRepository>()
    private val submissionRepository = mock<SubmissionRepository>()
    private val clarificationRepository = mock<ClarificationRepository>()
    private val leaderboardBuilder = mock<LeaderboardBuilder>()
    private val service =
        BuildJudgeDashboardService(
            contestRepository,
            memberRepository,
            submissionRepository,
            clarificationRepository,
            leaderboardBuilder,
        )

    @AfterEach
    fun clearAuthentication() = TestAuthentication.clear()

    @Test
    fun `builds dashboard for judge`() {
        val contest = MockEntityFactory.contest()
        val judge = MockEntityFactory.member(contest = contest, type = Member.Type.JUDGE)
        TestAuthentication.setMember(judge)
        whenever(contestRepository.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(judge.id, contest.id)).thenReturn(judge)
        whenever(
            leaderboardBuilder.build(
                contest,
                true,
            ),
        ).thenReturn(MockModelFactory.leaderboard(contestId = contest.id))
        whenever(submissionRepository.findAllByContestId(contest.id)).thenReturn(emptyList())
        whenever(clarificationRepository.findAllByContestId(contest.id)).thenReturn(emptyList())

        assertEquals(contest.id, service.execute(BuildJudgeDashboardUseCase.Command(contest.id)).contest.id)
        verify(submissionRepository).findAllByContestId(contest.id)
    }

    @Test
    fun `rejects admin role`() {
        val contest = MockEntityFactory.contest()
        val admin = MockEntityFactory.member(contest = contest, type = Member.Type.ADMIN)
        TestAuthentication.setMember(admin)
        whenever(contestRepository.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(admin.id, contest.id)).thenReturn(admin)

        assertThrows(ForbiddenException::class.java) {
            service.execute(BuildJudgeDashboardUseCase.Command(contest.id))
        }
        verify(leaderboardBuilder, never()).build(any(), any())
    }
}
