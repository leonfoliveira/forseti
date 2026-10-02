package com.forsetijudge.core.application.helper.leaderboard

import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.test.factory.MockEntityFactory
import java.time.OffsetDateTime
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class LeaderboardCellBuilderTest {
    private val builder = LeaderboardCellBuilder()

    @Test
    fun `calculates accepted time and wrong answer penalty in chronological order`() {
        val startAt = OffsetDateTime.now().minusHours(2)
        val contest = MockEntityFactory.contest(startAt = startAt)
        val member = MockEntityFactory.member()
        val problem = MockEntityFactory.problem(contest = contest, letter = 'C', color = "#abcdef")
        val acceptedAt = startAt.plusMinutes(37)
        val submissions =
            listOf(
                MockEntityFactory.submission(
                    createdAt = acceptedAt,
                    member = member,
                    problem = problem,
                    answer = Submission.Answer.ACCEPTED,
                ),
                MockEntityFactory.submission(
                    createdAt = startAt.plusMinutes(10),
                    member = member,
                    problem = problem,
                    answer = Submission.Answer.WRONG_ANSWER,
                ),
                MockEntityFactory.submission(
                    createdAt = startAt.plusMinutes(20),
                    member = member,
                    problem = problem,
                    answer = Submission.Answer.COMPILATION_ERROR,
                ),
            )

        val cell = builder.build(contest, member, problem, submissions)

        assertTrue(cell.isAccepted)
        assertEquals(member.id, cell.memberId)
        assertEquals(problem.id, cell.problemId)
        assertEquals('C', cell.problemLetter)
        assertEquals("#abcdef", cell.problemColor)
        assertEquals(acceptedAt, cell.acceptedAt)
        assertEquals(2, cell.wrongSubmissions)
        assertEquals(77, cell.penalty)
    }

    @Test
    fun `does not count penalty for unaccepted problem`() {
        val contest = MockEntityFactory.contest()
        val member = MockEntityFactory.member()
        val problem = MockEntityFactory.problem(contest = contest)
        val submissions =
            listOf(
                MockEntityFactory.submission(
                    member = member,
                    problem = problem,
                    answer = Submission.Answer.WRONG_ANSWER,
                ),
                MockEntityFactory.submission(
                    member = member,
                    problem = problem,
                    answer = Submission.Answer.COMPILATION_ERROR,
                ),
            )

        val cell = builder.build(contest, member, problem, submissions)

        assertFalse(cell.isAccepted)
        assertEquals(null, cell.acceptedAt)
        assertEquals(2, cell.wrongSubmissions)
        assertEquals(0, cell.penalty)
    }
}
