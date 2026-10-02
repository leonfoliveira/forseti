package com.forsetijudge.core.application.service.dashboard

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.application.helper.leaderboard.LeaderboardBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.input.usecase.dashboard.BuildAdminDashboardUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import com.forsetijudge.core.test.factory.MockEntityFactory
import com.forsetijudge.core.test.factory.MockModelFactory
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
    private val contests = mock<ContestRepository>()
    private val members = mock<MemberRepository>()
    private val submissions = mock<SubmissionRepository>()
    private val leaderboardBuilder = mock<LeaderboardBuilder>()
    private val service = BuildAdminDashboardService(contests, members, submissions, leaderboardBuilder)

    @AfterEach
    fun clearAuthentication() = TestAuthentication.clear()

    @Test
    fun `builds dashboard for root`() {
        val contest = MockEntityFactory.contest()
        val root = MockEntityFactory.member(type = Member.Type.ROOT)
        TestAuthentication.setMember(root)
        whenever(contests.findById(contest.id)).thenReturn(contest)
        whenever(members.findByIdAndContestIdOrContestIsNull(root.id, contest.id)).thenReturn(root)
        whenever(leaderboardBuilder.build(contest)).thenReturn(MockModelFactory.leaderboard(contestId = contest.id))
        whenever(submissions.findAllByContestId(contest.id)).thenReturn(emptyList())

        val result = service.execute(BuildAdminDashboardUseCase.Command(contest.id))

        assertEquals(contest.id, result.contest.id)
        verify(leaderboardBuilder).build(contest)
        verify(submissions).findAllByContestId(contest.id)
    }

    @Test
    fun `rejects contestants and missing contest`() {
        val contest = MockEntityFactory.contest()
        val contestant = MockEntityFactory.member(contest = contest)
        TestAuthentication.setMember(contestant)
        whenever(contests.findById(contest.id)).thenReturn(contest)
        whenever(members.findByIdAndContestIdOrContestIsNull(contestant.id, contest.id)).thenReturn(contestant)
        assertThrows(ForbiddenException::class.java) {
            service.execute(BuildAdminDashboardUseCase.Command(contest.id))
        }
        verify(leaderboardBuilder, never()).build(any())

        whenever(contests.findById(contest.id)).thenReturn(null)
        assertThrows(NotFoundException::class.java) {
            service.execute(BuildAdminDashboardUseCase.Command(contest.id))
        }
    }
}
