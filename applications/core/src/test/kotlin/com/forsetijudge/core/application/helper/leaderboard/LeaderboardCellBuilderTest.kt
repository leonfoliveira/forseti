package com.forsetijudge.core.application.helper.leaderboard

import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.factory.MockEntityFactory
import java.time.Duration
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertNotNull
import org.junit.jupiter.api.assertNull

class LeaderboardCellBuilderTest {
    private val leaderboardCellBuilder = LeaderboardCellBuilder()

    @Test
    fun `should build cell for problems with no submissions`() {
        val contest = MockEntityFactory.contest()
        val member = MockEntityFactory.member()
        val problem = MockEntityFactory.problem()
        val submissions = emptyList<Submission>()

        val cell = leaderboardCellBuilder.build(contest, member, problem, submissions)

        assertEquals(member.id, cell.memberId)
        assertEquals(problem.id, cell.problemId)
        assertEquals(problem.letter, cell.problemLetter)
        assertEquals(problem.color, cell.problemColor)
        assertFalse(cell.isAccepted)
        assertNull(cell.acceptedAt)
        assertEquals(0, cell.wrongSubmissions)
        assertEquals(0, cell.penalty)
    }

    @Test
    fun `should build cell for problems with only pending submissions`() {
        val contest = MockEntityFactory.contest()
        val member = MockEntityFactory.member()
        val problem = MockEntityFactory.problem()
        val submissions =
            listOf(
                MockEntityFactory.submission(status = Submission.Status.JUDGING),
            )

        val cell = leaderboardCellBuilder.build(contest, member, problem, submissions)

        assertEquals(member.id, cell.memberId)
        assertEquals(problem.id, cell.problemId)
        assertEquals(problem.letter, cell.problemLetter)
        assertEquals(problem.color, cell.problemColor)
        assertFalse(cell.isAccepted)
        assertNull(cell.acceptedAt)
        assertEquals(0, cell.wrongSubmissions)
        assertEquals(0, cell.penalty)
    }

    @Test
    fun `should build cell for problems with only wrong submissions`() {
        val contest = MockEntityFactory.contest()
        val member = MockEntityFactory.member()
        val problem = MockEntityFactory.problem()
        val submissions =
            listOf(
                MockEntityFactory.submission(answer = Submission.Answer.WRONG_ANSWER),
                MockEntityFactory.submission(answer = Submission.Answer.TIME_LIMIT_EXCEEDED),
                MockEntityFactory.submission(status = Submission.Status.JUDGING),
            )

        val cell = leaderboardCellBuilder.build(contest, member, problem, submissions)

        assertEquals(member.id, cell.memberId)
        assertEquals(problem.id, cell.problemId)
        assertEquals(problem.letter, cell.problemLetter)
        assertEquals(problem.color, cell.problemColor)
        assertFalse(cell.isAccepted)
        assertNull(cell.acceptedAt)
        assertEquals(2, cell.wrongSubmissions)
        assertEquals(0, cell.penalty)
    }

    @Test
    fun `should build cell for problems with only accepted submissions`() {
        val contest = MockEntityFactory.contest()
        val member = MockEntityFactory.member()
        val problem = MockEntityFactory.problem()
        val submissions =
            listOf(
                MockEntityFactory.submission(answer = Submission.Answer.ACCEPTED),
                MockEntityFactory.submission(answer = Submission.Answer.ACCEPTED),
                MockEntityFactory.submission(status = Submission.Status.JUDGING),
            )

        val cell = leaderboardCellBuilder.build(contest, member, problem, submissions)

        assertEquals(member.id, cell.memberId)
        assertEquals(problem.id, cell.problemId)
        assertEquals(problem.letter, cell.problemLetter)
        assertEquals(problem.color, cell.problemColor)
        assertTrue(cell.isAccepted)
        assertNotNull(submissions.first().createdAt)
        assertEquals(0, cell.wrongSubmissions)
        assertEquals(Duration.between(contest.startAt, submissions.first().createdAt).toMinutes().toInt(), cell.penalty)
    }

    @Test
    fun `should build cell for problems with wrong submissions before accepted submission`() {
        val contest = MockEntityFactory.contest()
        val member = MockEntityFactory.member()
        val problem = MockEntityFactory.problem()
        val submissions =
            listOf(
                MockEntityFactory.submission(answer = Submission.Answer.WRONG_ANSWER),
                MockEntityFactory.submission(answer = Submission.Answer.TIME_LIMIT_EXCEEDED),
                MockEntityFactory.submission(answer = Submission.Answer.ACCEPTED),
                MockEntityFactory.submission(status = Submission.Status.JUDGING),
            )

        val cell = leaderboardCellBuilder.build(contest, member, problem, submissions)

        assertEquals(member.id, cell.memberId)
        assertEquals(problem.id, cell.problemId)
        assertEquals(problem.letter, cell.problemLetter)
        assertEquals(problem.color, cell.problemColor)
        assertTrue(cell.isAccepted)
        assertNotNull(submissions[2].createdAt)
        assertEquals(2, cell.wrongSubmissions)
        assertEquals(40 + Duration.between(contest.startAt, submissions[2].createdAt).toMinutes().toInt(), cell.penalty)
    }
}
