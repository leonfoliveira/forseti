package com.forsetijudge.core.application.helper.leaderboard

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.model.Leaderboard
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.factory.MockModelFactory
import com.forsetijudge.core.port.output.cache.LeaderboardCacheStore
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.OffsetDateTime

class LeaderboardBuilderTest {
    private val members = mock<MemberRepository>()
    private val submissions = mock<SubmissionRepository>()
    private val cache = mock<LeaderboardCacheStore>()
    private val builder = LeaderboardBuilder(members, submissions, LeaderboardCellBuilder(), cache)

    @Test
    fun `builds rows from cached and submitted cells and ranks contestants`() {
        val startAt = OffsetDateTime.now().minusHours(2)
        val contest = MockEntityFactory.contest(startAt = startAt)
        val problemA = MockEntityFactory.problem(contest = contest, letter = 'A')
        val problemB = MockEntityFactory.problem(contest = contest, letter = 'B')
        contest.problems = listOf(problemA, problemB)
        val first = MockEntityFactory.member(contest = contest, name = "First")
        val second = MockEntityFactory.member(contest = contest, name = "Second")
        val noScore = MockEntityFactory.member(contest = contest, name = "No score")
        val contestants = listOf(second, noScore, first)
        val cachedCell =
            MockModelFactory.leaderboardCell(
                memberId = first.id,
                problemId = problemA.id,
                problemLetter = 'A',
                isAccepted = true,
                acceptedAt = startAt.plusMinutes(15),
                wrongSubmissions = 1,
                penalty = 35,
            )
        whenever(members.findAllByContestIdAndTypeIn(contest.id, listOf(Member.Type.CONTESTANT)))
            .thenReturn(contestants)
        whenever(cache.getAllCellsByContestId(contest.id)).thenReturn(listOf(cachedCell))
        whenever(
            submissions.findByContestIdAndStatusAndMemberAndProblemPairsNotIn(
                contestId = eq(contest.id),
                status = eq(Submission.Status.JUDGED),
                excludedPairs = any(),
            ),
        ).thenReturn(
            listOf(
                MockEntityFactory.submission(
                    createdAt = startAt.plusMinutes(10),
                    member = first,
                    problem = problemB,
                    answer = Submission.Answer.ACCEPTED,
                ),
                MockEntityFactory.submission(
                    createdAt = startAt.plusMinutes(5),
                    member = second,
                    problem = problemA,
                    answer = Submission.Answer.ACCEPTED,
                ),
            ),
        )

        val result = builder.build(contest)

        assertEquals(contest.id, result.contestId)
        assertEquals(startAt, result.contestStartAt)
        assertEquals(listOf("First", "Second", "No score"), result.rows.map(Leaderboard.Row::memberName))
        assertEquals(listOf(2, 1, 0), result.rows.map(Leaderboard.Row::score))
        assertEquals(45, result.rows.first().penalty)
        assertEquals(
            listOf('A', 'B'),
            result.rows
                .first()
                .cells
                .map(Leaderboard.Cell::problemLetter),
        )
        verify(submissions).findByContestIdAndStatusAndMemberAndProblemPairsNotIn(
            contestId = eq(contest.id),
            status = eq(Submission.Status.JUDGED),
            excludedPairs = eq(listOf("${first.id}:${problemA.id}")),
        )
    }

    @Test
    fun `returns an empty leaderboard when no members or problems exist`() {
        val contest = MockEntityFactory.contest()
        whenever(members.findAllByContestIdAndTypeIn(contest.id, listOf(Member.Type.CONTESTANT)))
            .thenReturn(emptyList())
        whenever(cache.getAllCellsByContestId(contest.id)).thenReturn(emptyList())
        whenever(
            submissions.findByContestIdAndStatusAndMemberAndProblemPairsNotIn(
                contestId = eq(contest.id),
                status = eq(Submission.Status.JUDGED),
                excludedPairs = any(),
            ),
        ).thenReturn(emptyList())

        assertEquals(emptyList<Leaderboard.Row>(), builder.build(contest).rows)
    }
}
