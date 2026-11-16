package com.forsetijudge.core.application.service.dashboard

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.application.helper.leaderboard.LeaderboardBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
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
    fun `throws NotFoundException when contest does not exist`() {
        val contest = MockEntityFactory.contest()
        val judge = MockEntityFactory.member(type = Member.Type.JUDGE)
        TestAuthentication.setMember(judge)
        whenever(contestRepository.findByIdNullable(contest.id)).thenReturn(null)

        assertThrows(NotFoundException::class.java) {
            service.execute(BuildJudgeDashboardUseCase.Command(contest.id))
        }
        verify(submissionRepository, never()).findAllByContestId(any())
    }

    @Test
    fun `throws NotFoundException when member does not exist`() {
        val contest = MockEntityFactory.contest()
        val judge = MockEntityFactory.member(type = Member.Type.JUDGE)
        TestAuthentication.setMember(judge)
        whenever(contestRepository.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(judge.id, contest.id)).thenReturn(null)

        assertThrows(NotFoundException::class.java) {
            service.execute(BuildJudgeDashboardUseCase.Command(contest.id))
        }
        verify(submissionRepository, never()).findAllByContestId(any())
    }

    @Test
    fun `throws ForbiddenException when member does not belong to contest`() {
        val contest = MockEntityFactory.contest()
        val judge = MockEntityFactory.member(type = Member.Type.JUDGE, contest = MockEntityFactory.contest())
        TestAuthentication.setMember(judge)
        whenever(contestRepository.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(judge.id, contest.id)).thenReturn(judge)

        assertThrows(ForbiddenException::class.java) {
            service.execute(BuildJudgeDashboardUseCase.Command(contest.id))
        }
    }

    @Test
    fun `throws ForbiddenException when member is not a judge`() {
        val contest = MockEntityFactory.contest()
        val contestant = MockEntityFactory.member(contest = contest, type = Member.Type.CONTESTANT)
        TestAuthentication.setMember(contestant)
        whenever(contestRepository.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(contestant.id, contest.id)).thenReturn(contestant)

        assertThrows(ForbiddenException::class.java) {
            service.execute(BuildJudgeDashboardUseCase.Command(contest.id))
        }
    }
}
