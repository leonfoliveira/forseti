package com.forsetijudge.core.application.service.dashboard

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.application.helper.leaderboard.LeaderboardBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.factory.MockModelFactory
import com.forsetijudge.core.port.input.usecase.dashboard.BuildContestantDashboardUseCase
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
import java.time.OffsetDateTime

class BuildContestantDashboardServiceTest {
    private val contests = mock<ContestRepository>()
    private val members = mock<MemberRepository>()
    private val submissions = mock<SubmissionRepository>()
    private val leaderboardBuilder = mock<LeaderboardBuilder>()
    private val service = BuildContestantDashboardService(contests, members, submissions, leaderboardBuilder)

    @AfterEach
    fun clearAuthentication() = TestAuthentication.clear()

    @Test
    fun `includes contestant own submissions in dashboard`() {
        val contest = MockEntityFactory.contest()
        val contestant = MockEntityFactory.member(contest = contest)
        TestAuthentication.setMember(contestant)
        whenever(contests.findById(contest.id)).thenReturn(contest)
        whenever(members.findByIdAndContestIdOrContestIsNull(contestant.id, contest.id)).thenReturn(contestant)
        whenever(leaderboardBuilder.build(contest)).thenReturn(MockModelFactory.leaderboard(contestId = contest.id))
        whenever(submissions.findAllByContestId(contest.id)).thenReturn(emptyList())
        whenever(submissions.findAllByContestIdAndMemberId(contest.id, contestant.id)).thenReturn(emptyList())

        val result = service.execute(BuildContestantDashboardUseCase.Command(contest.id))

        assertEquals(contest.id, result.contest.id)
        assertEquals(emptyList<Any>(), result.memberSubmissions)
        verify(submissions).findAllByContestIdAndMemberId(contest.id, contestant.id)
    }

    @Test
    fun `rejects contestants before contest starts`() {
        val contest = MockEntityFactory.contest(startAt = OffsetDateTime.now().plusHours(1))
        val contestant = MockEntityFactory.member(contest = contest)
        TestAuthentication.setMember(contestant)
        whenever(contests.findById(contest.id)).thenReturn(contest)
        whenever(members.findByIdAndContestIdOrContestIsNull(contestant.id, contest.id)).thenReturn(contestant)

        assertThrows(ForbiddenException::class.java) {
            service.execute(BuildContestantDashboardUseCase.Command(contest.id))
        }
        verify(leaderboardBuilder, never()).build(any())
    }
}
