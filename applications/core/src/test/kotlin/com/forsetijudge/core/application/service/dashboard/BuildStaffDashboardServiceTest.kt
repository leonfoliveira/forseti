package com.forsetijudge.core.application.service.dashboard

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.application.helper.leaderboard.LeaderboardBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.factory.MockModelFactory
import com.forsetijudge.core.port.input.usecase.dashboard.BuildStaffDashboardUseCase
import com.forsetijudge.core.port.output.repository.ClarificationRepository
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.PrintRequestRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever

class BuildStaffDashboardServiceTest {
    private val contestRepository = mock<ContestRepository>()
    private val memberRepository = mock<MemberRepository>()
    private val submissionRepository = mock<SubmissionRepository>()
    private val clarificationRepository = mock<ClarificationRepository>()
    private val printRequestRepository = mock<PrintRequestRepository>()
    private val leaderboardBuilder = mock<LeaderboardBuilder>()
    private val service =
        BuildStaffDashboardService(
            contestRepository,
            memberRepository,
            submissionRepository,
            clarificationRepository,
            printRequestRepository,
            leaderboardBuilder,
        )

    @AfterEach
    fun clearAuthentication() = TestAuthentication.clear()

    @Test
    fun `builds staff dashboard`() {
        val contest = MockEntityFactory.contest()
        val staff = MockEntityFactory.member(contest = contest, type = Member.Type.STAFF)
        TestAuthentication.setMember(staff)
        whenever(contestRepository.findByIdNullable(contest.id)).thenReturn(contest)
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
        whenever(printRequestRepository.findAllByContestId(contest.id)).thenReturn(emptyList())

        val result = service.execute(BuildStaffDashboardUseCase.Command(contest.id))

        assertEquals(contest.id, result.contest.id)
    }

    @Test
    fun `throws NotFoundException when contest does not exist`() {
        val contest = MockEntityFactory.contest()
        val staff = MockEntityFactory.member(type = Member.Type.STAFF)
        TestAuthentication.setMember(staff)
        whenever(contestRepository.findByIdNullable(contest.id)).thenReturn(null)

        assertThrows(NotFoundException::class.java) {
            service.execute(BuildStaffDashboardUseCase.Command(contest.id))
        }
    }

    @Test
    fun `throws NotFoundException when member does not exist`() {
        val contest = MockEntityFactory.contest()
        val staff = MockEntityFactory.member(type = Member.Type.STAFF)
        TestAuthentication.setMember(staff)
        whenever(contestRepository.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(staff.id, contest.id)).thenReturn(null)

        assertThrows(NotFoundException::class.java) {
            service.execute(BuildStaffDashboardUseCase.Command(contest.id))
        }
    }

    @Test
    fun `throws ForbiddenException when member does not belong to contest`() {
        val contest = MockEntityFactory.contest()
        val staff = MockEntityFactory.member(type = Member.Type.STAFF, contest = MockEntityFactory.contest())
        TestAuthentication.setMember(staff)
        whenever(contestRepository.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(staff.id, contest.id)).thenReturn(staff)

        assertThrows(ForbiddenException::class.java) {
            service.execute(BuildStaffDashboardUseCase.Command(contest.id))
        }
    }

    @Test
    fun `throws ForbiddenException when member is not a staff`() {
        val contest = MockEntityFactory.contest()
        val contestant = MockEntityFactory.member(contest = contest, type = Member.Type.CONTESTANT)
        TestAuthentication.setMember(contestant)
        whenever(contestRepository.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(contestant.id, contest.id)).thenReturn(contestant)

        assertThrows(ForbiddenException::class.java) {
            service.execute(BuildStaffDashboardUseCase.Command(contest.id))
        }
    }
}
