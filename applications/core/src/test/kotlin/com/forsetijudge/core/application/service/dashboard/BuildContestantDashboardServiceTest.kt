package com.forsetijudge.core.application.service.dashboard

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.application.helper.leaderboard.LeaderboardBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.factory.MockModelFactory
import com.forsetijudge.core.port.input.usecase.dashboard.BuildContestantDashboardUseCase
import com.forsetijudge.core.port.output.repository.ClarificationRepository
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.FrozenSubmissionRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.PrintRequestRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import java.time.OffsetDateTime
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class BuildContestantDashboardServiceTest {
    private val contestRepository = mock<ContestRepository>()
    private val memberRepository = mock<MemberRepository>()
    private val submissionRepository = mock<SubmissionRepository>()
    private val frozenSubmissionRepository = mock<FrozenSubmissionRepository>()
    private val clarificationRepository = mock<ClarificationRepository>()
    private val printRequestRepository = mock<PrintRequestRepository>()
    private val leaderboardBuilder = mock<LeaderboardBuilder>()
    private val service =
        BuildContestantDashboardService(
            contestRepository,
            memberRepository,
            submissionRepository,
            frozenSubmissionRepository,
            clarificationRepository,
            printRequestRepository,
            leaderboardBuilder,
        )

    @AfterEach
    fun clearAuthentication() = TestAuthentication.clear()

    @Test
    fun `builds the dashboard successfully`() {
        val contest = MockEntityFactory.contest()
        val contestant = MockEntityFactory.member(contest = contest)
        TestAuthentication.setMember(contestant)
        whenever(contestRepository.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(contestant.id, contest.id)).thenReturn(contestant)
        whenever(leaderboardBuilder.build(contest)).thenReturn(MockModelFactory.leaderboard(contestId = contest.id))
        whenever(submissionRepository.findAllByContestId(contest.id)).thenReturn(emptyList())
        whenever(frozenSubmissionRepository.findAllByContestId(contest.id)).thenReturn(emptyList())
        whenever(submissionRepository.findAllByContestIdAndMemberId(contest.id, contestant.id)).thenReturn(emptyList())
        whenever(clarificationRepository.findAllByContestIdAndMemberIdOrIsPublic(contest.id, contestant.id)).thenReturn(
            emptyList(),
        )
        whenever(
            printRequestRepository.findAllByContestIdAndMemberId(
                contest.id,
                contestant.id,
            ),
        ).thenReturn(emptyList())

        val result = service.execute(BuildContestantDashboardUseCase.Command(contest.id))

        assertEquals(contest.id, result.contest.id)
        assertEquals(emptyList<Any>(), result.memberSubmissions)
        verify(submissionRepository).findAllByContestIdAndMemberId(contest.id, contestant.id)
    }

    @Test
    fun `builds the dashboard successfully when contest is frozen`() {
        val contest = MockEntityFactory.contest(frozenAt = OffsetDateTime.now().minusDays(1))
        val contestant = MockEntityFactory.member(contest = contest)
        TestAuthentication.setMember(contestant)
        whenever(contestRepository.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(contestant.id, contest.id)).thenReturn(contestant)
        whenever(leaderboardBuilder.build(contest)).thenReturn(MockModelFactory.leaderboard(contestId = contest.id))
        whenever(submissionRepository.findAllByContestId(contest.id)).thenReturn(emptyList())
        whenever(frozenSubmissionRepository.findAllByContestId(contest.id)).thenReturn(emptyList())
        whenever(submissionRepository.findAllByContestIdAndMemberId(contest.id, contestant.id)).thenReturn(emptyList())
        whenever(clarificationRepository.findAllByContestIdAndMemberIdOrIsPublic(contest.id, contestant.id)).thenReturn(
            emptyList(),
        )
        whenever(
            printRequestRepository.findAllByContestIdAndMemberId(
                contest.id,
                contestant.id,
            ),
        ).thenReturn(emptyList())

        val result = service.execute(BuildContestantDashboardUseCase.Command(contest.id))

        assertEquals(contest.id, result.contest.id)
        assertEquals(emptyList<Any>(), result.memberSubmissions)
        verify(frozenSubmissionRepository).findAllByContestId(contest.id)
    }

    @Test
    fun `throws NotFoundException when contest does not exist`() {
        val contestant = MockEntityFactory.member()
        TestAuthentication.setMember(contestant)
        whenever(contestRepository.findByIdNullable(any())).thenReturn(null)

        assertThrows(NotFoundException::class.java) {
            service.execute(BuildContestantDashboardUseCase.Command(MockEntityFactory.contest().id))
        }
    }

    @Test
    fun `throws NotFoundException when member does not exist`() {
        val contest = MockEntityFactory.contest()
        TestAuthentication.setMember(MockEntityFactory.member())
        whenever(contestRepository.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(any(), any())).thenReturn(null)

        assertThrows(NotFoundException::class.java) {
            service.execute(BuildContestantDashboardUseCase.Command(contest.id))
        }
    }

    @Test
    fun `throws ForbiddenException when member does not belong to contest`() {
        val contest = MockEntityFactory.contest()
        val contestant = MockEntityFactory.member(type = Member.Type.CONTESTANT, contest = MockEntityFactory.contest())
        TestAuthentication.setMember(contestant)
        whenever(contestRepository.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(contestant.id, contest.id)).thenReturn(contestant)

        assertThrows(ForbiddenException::class.java) {
            service.execute(BuildContestantDashboardUseCase.Command(contest.id))
        }
    }

    @Test
    fun `throws ForbiddenException when member is not a contestant`() {
        val contest = MockEntityFactory.contest()
        val judge = MockEntityFactory.member(contest = contest, type = Member.Type.JUDGE)
        TestAuthentication.setMember(judge)
        whenever(contestRepository.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(judge.id, contest.id)).thenReturn(judge)

        assertThrows(ForbiddenException::class.java) {
            service.execute(BuildContestantDashboardUseCase.Command(contest.id))
        }
    }

    @Test
    fun `throws ForbiddenException when contest has not started`() {
        val contest = MockEntityFactory.contest(startAt = OffsetDateTime.now().plusDays(1))
        val contestant = MockEntityFactory.member(contest = contest, type = Member.Type.CONTESTANT)
        TestAuthentication.setMember(contestant)
        whenever(contestRepository.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(contestant.id, contest.id)).thenReturn(contestant)

        assertThrows(ForbiddenException::class.java) {
            service.execute(BuildContestantDashboardUseCase.Command(contest.id))
        }
    }
}
