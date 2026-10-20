package com.forsetijudge.core.application.service.dashboard

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.application.helper.leaderboard.LeaderboardBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.factory.MockModelFactory
import com.forsetijudge.core.port.input.usecase.dashboard.BuildStaffDashboardUseCase
import com.forsetijudge.core.port.output.repository.ClarificationRepository
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever

class BuildStaffDashboardServiceTest {
    private val contestRepository = mock<ContestRepository>()
    private val memberRepository = mock<MemberRepository>()
    private val submissionRepository = mock<SubmissionRepository>()
    private val clarificationRepository = mock<ClarificationRepository>()
    private val leaderboardBuilder = mock<LeaderboardBuilder>()
    private val service =
        BuildStaffDashboardService(
            contestRepository,
            memberRepository,
            submissionRepository,
            clarificationRepository,
            leaderboardBuilder,
        )

    @AfterEach
    fun clearAuthentication() = TestAuthentication.clear()

    @Test
    fun `builds staff dashboard`() {
        val contest = MockEntityFactory.contest()
        val staff = MockEntityFactory.member(contest = contest, type = Member.Type.STAFF)
        TestAuthentication.setMember(staff)
        whenever(contestRepository.findById(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(staff.id, contest.id)).thenReturn(staff)
        whenever(
            leaderboardBuilder.build(
                contest,
                true,
            ),
        ).thenReturn(MockModelFactory.leaderboard(contestId = contest.id))
        whenever(submissionRepository.findAllByContestId(contest.id)).thenReturn(emptyList())
        whenever(submissionRepository.findAllByContestIdAndMemberId(contest.id, staff.id)).thenReturn(emptyList())
        whenever(clarificationRepository.findAllByContestIdAndIsPublic(contest.id)).thenReturn(
            emptyList(),
        )

        val result = service.execute(BuildStaffDashboardUseCase.Command(contest.id))

        assertEquals(contest.id, result.contest.id)
    }
}
