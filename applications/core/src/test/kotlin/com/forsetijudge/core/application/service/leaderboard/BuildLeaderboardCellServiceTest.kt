package com.forsetijudge.core.application.service.leaderboard

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.application.helper.leaderboard.LeaderboardCellBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.factory.MockModelFactory
import com.forsetijudge.core.port.input.usecase.leaderboard.BuildLeaderboardCellUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.ProblemRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import java.time.OffsetDateTime
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class BuildLeaderboardCellServiceTest {
    private val contests = mock<ContestRepository>()
    private val members = mock<MemberRepository>()
    private val problems = mock<ProblemRepository>()
    private val submissions = mock<SubmissionRepository>()
    private val cellBuilder = mock<LeaderboardCellBuilder>()
    private val service =
        BuildLeaderboardCellService(contests, members, problems, submissions, cellBuilder)

    @AfterEach
    fun clearAuthentication() = TestAuthentication.clear()

    @Test
    fun `builds cell using judged submissions and permitted viewer`() {
        val contest = MockEntityFactory.contest()
        val judge = MockEntityFactory.member(contest = contest, type = Member.Type.JUDGE)
        val targetMember = MockEntityFactory.member(contest = contest)
        val problem = MockEntityFactory.problem(contest = contest)
        val submission = MockEntityFactory.submission(member = targetMember, problem = problem)
        val expectedCell =
            MockModelFactory.leaderboardCell(
                memberId = targetMember.id,
                problemId = problem.id,
                isAccepted = true,
                acceptedAt = OffsetDateTime.now(),
                penalty = 10,
            )
        TestAuthentication.setMember(judge)
        whenever(contests.findById(contest.id)).thenReturn(contest)
        whenever(members.findByIdAndContestIdOrContestIsNull(judge.id, contest.id)).thenReturn(judge)
        whenever(members.findByIdAndContestId(targetMember.id, contest.id)).thenReturn(targetMember)
        whenever(problems.findByIdAndContestId(problem.id, contest.id)).thenReturn(problem)
        whenever(
            submissions.findAllByMemberIdAndProblemIdAndStatus(
                targetMember.id,
                problem.id,
                Submission.Status.JUDGED,
            ),
        ).thenReturn(listOf(submission))
        whenever(cellBuilder.build(contest, targetMember, problem, listOf(submission))).thenReturn(expectedCell)

        val result =
            service.execute(
                BuildLeaderboardCellUseCase.Command(contest.id, targetMember.id, problem.id),
            )

        assertEquals(expectedCell.memberId, result.memberId)
        assertEquals(expectedCell.problemId, result.problemId)
        verify(cellBuilder).build(contest, targetMember, problem, listOf(submission))
    }

    @Test
    fun `throws when target problem is not found`() {
        val contest = MockEntityFactory.contest()
        val admin = MockEntityFactory.member(type = Member.Type.ADMIN)
        val targetId = java.util.UUID.randomUUID()
        val problemId = java.util.UUID.randomUUID()
        TestAuthentication.setMember(admin)
        whenever(contests.findById(contest.id)).thenReturn(contest)
        whenever(members.findByIdAndContestIdOrContestIsNull(admin.id, contest.id)).thenReturn(admin)
        whenever(members.findByIdAndContestId(targetId, contest.id)).thenReturn(null)

        assertThrows(NotFoundException::class.java) {
            service.execute(BuildLeaderboardCellUseCase.Command(contest.id, targetId, problemId))
        }
    }
}
